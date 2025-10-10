from prisma import Prisma
from typing import Optional

class DatabaseManager:
    _instance: Optional['DatabaseManager'] = None
    _db: Optional[Prisma] = None

    def __new__(cls) -> 'DatabaseManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def connect(self) -> Prisma:
        if self._db is None:
            self._db = Prisma()
            await self._db.connect()
        return self._db

    async def disconnect(self):
        if self._db is not None:
            await self._db.disconnect()
            self._db = None

    @property
    def db(self) -> Optional[Prisma]:
        return self._db

# Global database manager instance
db_manager = DatabaseManager()

async def get_database() -> Prisma:
    """Get database connection for dependency injection"""
    return await db_manager.connect()
