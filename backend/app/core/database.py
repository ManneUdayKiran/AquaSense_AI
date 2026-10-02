import json
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path
from threading import Lock

try:
    from pymongo import MongoClient  # type: ignore
except ImportError:
    MongoClient = None

from app.core.config import settings
from app.models.schemas import Observation

logger = logging.getLogger(__name__)

class DatabaseRepository:
    """
    Resilient Database layer.
    Uses MongoDB Atlas when MONGODB_URI is provided;
    gracefully falls back to atomic local JSON storage for zero-dependency execution.
    """

    client: Any = None
    db: Any = None
    collection: Any = None

    def __init__(self):
        self.use_mongo: bool = False
        self.client: Any = None
        self.db: Any = None
        self.collection: Any = None
        self.lock = Lock()
        self.local_file = settings.DATA_DIR / "aquasense_store.json"

        if settings.MONGODB_URI:
            if MongoClient is None:
                logger.warning("MONGODB_URI is configured but pymongo is not installed. Falling back to local file storage.")
                self.use_mongo = False
            else:
                try:
                    self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
                    # Test connection
                    self.client.admin.command('ping')
                    self.db = self.client[settings.MONGODB_DB_NAME]
                    self.collection = self.db["observations"]
                    self.use_mongo = True
                    logger.info("Connected successfully to MongoDB Atlas.")
                except Exception as e:
                    logger.warning(f"MongoDB connection failed: {e}. Falling back to resilient local file storage.")
                    self.use_mongo = False

        if not self.use_mongo:
            self._init_local_store()

    def _init_local_store(self):
        if not self.local_file.exists():
            with open(self.local_file, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _read_local_all(self) -> List[Dict[str, Any]]:
        with self.lock:
            if not self.local_file.exists():
                return []
            try:
                with open(self.local_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to read local store: {e}")
                return []

    def _write_local_all(self, records: List[Dict[str, Any]]):
        with self.lock:
            temp_file = self.local_file.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2, ensure_ascii=False)
            temp_file.replace(self.local_file)

    def save_observation(self, observation: Observation) -> Observation:
        doc = observation.model_dump()
        if self.use_mongo and self.collection is not None:
            self.collection.update_one({"id": observation.id}, {"$set": doc}, upsert=True)
        else:
            records = self._read_local_all()
            existing_idx = next((i for i, r in enumerate(records) if r["id"] == observation.id), None)
            if existing_idx is not None:
                records[existing_idx] = doc
            else:
                records.append(doc)
            self._write_local_all(records)
        return observation

    def get_observation(self, obs_id: str) -> Optional[Observation]:
        if self.use_mongo and self.collection is not None:
            doc = self.collection.find_one({"id": obs_id})
            if doc:
                doc.pop("_id", None)
                return Observation(**doc)
            return None
        else:
            records = self._read_local_all()
            doc = next((r for r in records if r["id"] == obs_id), None)
            if doc:
                return Observation(**doc)
            return None

    def list_observations(
        self,
        limit: int = 100,
        skip: int = 0,
        status: Optional[str] = None,
        severity: Optional[str] = None
    ) -> List[Observation]:
        if self.use_mongo and self.collection is not None:
            query = {}
            if status:
                query["status"] = status
            if severity:
                query["ai_assessment.severity"] = severity
            cursor = self.collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
            results = []
            for doc in cursor:
                doc.pop("_id", None)
                results.append(Observation(**doc))
            return results
        else:
            records = self._read_local_all()
            if status:
                records = [r for r in records if r.get("status") == status]
            if severity:
                records = [r for r in records if r.get("ai_assessment", {}).get("severity") == severity]
            records = sorted(records, key=lambda x: x.get("created_at", ""), reverse=True)
            page = records[skip : skip + limit]
            return [Observation(**r) for r in page]

    def count_observations(self) -> int:
        if self.use_mongo and self.collection is not None:
            return self.collection.count_documents({})
        else:
            return len(self._read_local_all())

    def delete_observation(self, obs_id: str) -> bool:
        if self.use_mongo and self.collection is not None:
            res = self.collection.delete_one({"id": obs_id})
            return res.deleted_count > 0
        else:
            records = self._read_local_all()
            filtered = [r for r in records if r.get("id") != obs_id]
            if len(filtered) != len(records):
                self._write_local_all(filtered)
                return True
            return False

db = DatabaseRepository()
