// User
export const MERGE_USER_CYPHER = `MERGE (u:User { id: $id }) SET u.email = $email, u.firstname = $firstname, u.lastname = $lastname, u.role = $role`;
export const REL_FOLLOW_CYPHER = `MATCH (u:User { id: $userId }) MATCH (f:User { id: $friendId }) MERGE(u)-[:FOLLOWS]->(f)`
export const REL_UNFOLLOW_CYPHER = `MATCH (u:User { id: $userId })-[r:FOLLOWS]->(f:User { id: $friendId }) DELETE r`
export const DETACH_USER_CYPHER = `MATCH (u:User { id: $id }) DETACH DELETE u`

// Course
export const MERGE_COURSE_CYPHER = `MERGE (c:Course {id: $id }) SET c.title = $title`;
export const REL_TEACHES_CYPHER = `MATCH (u:User { id: $userId }) MATCH (c:Course { id: $courseId }) MERGE (u)-[:TEACHES]->(c)`;
export const REL_ENROLLED_IN_CYPHER = `MATCH (u:User { id: $userId }) MATCH (c:Course { id: $courseId }) MERGE (u)-[:ENROLLED_IN]->(c)`;
export const REL_UNENROLL_IN_CYPHER = `MATCH (u:User {id: $userId })-[r:ENROLLED_IN]->(c:Course {id: $courseId}) DELETE r`;
export const REL_REVIEWED_CYPHER = `MATCH (u:User { id: $userId }) MATCH (c:Course { id: $courseId }) MERGE(u)-[r:REVIEWED]->(c) SET r.id = $id, r.rating = $rating`;
export const DETACH_REVIEW_CYPHER = `MATCH (u:User { id: $userId })-[r:REVIEWED]->(c:Course { id: $courseId }) DELETE r`
export const DETACH_COURSE_CYPHER = `MATCH (c:Course { id: $id }) DETACH DELETE c`
export const REL_UNTEACHES_CYPHER = `MATCH (u:User {id: $userId })-[r:TEACHES]->(c:Course {id: $courseId}) DELETE r`

// Lesson
export const MERGE_LESSON_CYPHER = `MERGE (l:Lesson {id: $id }) SET l.title = $title`;
export const REL_HAS_LESSON_CYPHER = `MATCH (c:Course { id: $courseId }) MATCH (l:Lesson { id: $lessonId}) MERGE(c)-[:HAS_LESSON]->(l)`;
export const REL_ATTENDS_CYPHER = `MATCH (u:User { id: $userId }) MATCH (l:Lesson { id: $lessonId }) MERGE(u)-[:ATTENDS]->(l)`;
export const REL_UNATTENDS_CYPHER = `MATCH (u:User {id: $userId })-[r:ATTENDS]->(l:Lesson {id: $lessonId}) DELETE r`;
export const DETACH_LESSON_CYPHER = `MATCH (l:Lesson { id: $id }) DETACH DELETE l`
export const REL_TEACHING_CYPHER = `MATCH (u:User { id: $userId}) MATCH (l:Lesson { id: $lessonId}) MERGE(u)-[:TEACHING]->(l)`

// RCMND
export const RCMND_CYPHER = 
    `MATCH (me:User { id: $userId })-[:FOLLOWS*1..3]->(friend:User)
    MATCH (friend)-[r:REVIEWED]->(c:Course)
    WHERE r.rating > 3
    AND NOT (me)-[:ENROLLED_IN]->(c)
    RETURN c, r.rating AS rating, friend`