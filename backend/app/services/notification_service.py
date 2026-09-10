from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.notification import Notification


class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        type: str,
        title: str,
        body: str,
        payload_json: Optional[Dict[str, Any]] = None,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            payload_json=payload_json,
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif


notification_service = NotificationService()
