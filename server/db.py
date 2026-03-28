from neo4j import AsyncGraphDatabase

driver = None
_database = "neo4j"


def init_driver(uri: str, user: str, password: str, database: str = "neo4j"):
    global driver, _database
    driver = AsyncGraphDatabase.driver(uri, auth=(user, password))
    _database = database


async def close_driver():
    global driver
    if driver:
        await driver.close()
        driver = None


async def get_session():
    async with driver.session(database=_database) as session:
        yield session


async def verify_connection():
    async with driver.session(database=_database) as session:
        result = await session.run("RETURN 1 AS n")
        record = await result.single()
        return record["n"] == 1
