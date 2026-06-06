from backend.services.session import (
    BaseSessionStore,
    InterviewSession
)

from backend.database.mongodb import sessions_collection


class MongoSessionStore(BaseSessionStore):

    def get(self, session_id: str):

        data = sessions_collection.find_one(
            {"session_id": session_id}
        )

        if not data:
            return None

        data.pop("_id", None)

        return InterviewSession(**data)

    def save(self, session: InterviewSession):

        sessions_collection.update_one(
            {"session_id": session.session_id},
            {"$set": session.model_dump()},
            upsert=True
        )

        print("SESSION SAVED")

    def delete(self, session_id: str):

        sessions_collection.delete_one(
            {"session_id": session_id}
        )