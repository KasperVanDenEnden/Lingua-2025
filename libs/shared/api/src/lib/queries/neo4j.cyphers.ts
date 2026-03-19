// User
export const MERGE_USER_CYPHER = `MERGE (u:User { id: $id }) SET u.email = $email, u.firstname = $firstname, u.lastname = $lastname, u.role = $role`;
export const REL_FOLLOWS_CYPHER = `MATCH (u:User { id: $userId }) MATCH (f:User { id: $friendId }) MERGE(u)-[:FOLLOWS]->(f)`

// Course
export const MERGE_COURSE_CYPHER = `MERGE (c:Course {id: $id }) SET c.title = $title`;
export const REL_TEACHES_CYPHER = `MATCH (u:User { id: $userId }) MATCH (c:Course { id: $courseId }) MERGE (u)-[:TEACHES]->(c)`;
export const REL_ENROLLED_IN_CYPHER = `MATCH (u:User { id: $userId }) MATCH (c:Course { id: $courseId }) MERGE (u)-[:ENROLLED_IN]->(c)`;
export const REL_REVIEWED_CYPHER = `MATCH (u:User { id: $userId }) MATCH (c:Course { id: $courseId }) MERGE(u)-[r:REVIEWED]->(c) SET r.id = $id, r.rating = $rating`;

// Lesson
export const MERGE_LESSON_CYPHER = `MERGE (c:Lesson {id: $id }) SET c.title = $title`;
export const REL_HAS_LESSON_CYPHER = `MATCH (c:Course { id: $courseId }) MATCH (l:Lesson { id: $lessonId}) MERGE(c)-[:HAS_LESSON]->(l)`;
export const REL_ATTENDS_CYPHER = `MATCH (u:User { id: $userId }) MATCH (l:Lesson { id: $lessonId }) MERGE(u)-[:ATTENDS]->(l)`;

// RCMND
export const RCMND_CYPHER = 
    `MATCH (me:User { id: $userId })-[:FOLLOWS]->(friend:User)
    MATCH (friend)-[r:REVIEWED]->(c:Course)
    WHERE r.rating > 3
    AND NOT (me)-[:ENROLLED_IN]->(c)
    RETURN c, r.rating AS rating, friend`