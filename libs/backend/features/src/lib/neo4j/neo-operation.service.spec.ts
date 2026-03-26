import { Test, TestingModule } from '@nestjs/testing';
import { NeoOperationsService } from './neo-operations.service';
import { Neo4jService } from '@lingua/neo4j';
import { Types } from 'mongoose';

describe('NeoOperationsService', () => {
  let service: NeoOperationsService;
  let mockNeo4j: Partial<Neo4jService>;

  beforeEach(async () => {
    mockNeo4j = {
      run: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeoOperationsService,
        { provide: Neo4jService, useValue: mockNeo4j },
      ],
    }).compile();

    service = module.get<NeoOperationsService>(NeoOperationsService);
  });

  it('should call MERGE_USER_CYPHER on mergeUser', async () => {
    const user = {
      _id: new Types.ObjectId(),
      email: 'test@test.com',
      firstname: 'John',
      lastname: 'Doe',
      role: 'student',
      teachers: [],
    };

    await service.mergeUser(user as any);

    expect(mockNeo4j.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        id: user._id.toString(),
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      }),
    );
  });

  it('should call REL_FOLLOW_CYPHER on followUser', async () => {
    await service.followUser('u1', 'u2');

    expect(mockNeo4j.run).toHaveBeenCalledWith(
      expect.any(String),
      { userId: 'u1', friendId: 'u2' },
    );
  });

  it('should call DETACH_USER_CYPHER on detachUser', async () => {
    await service.detachUser('u1');

    expect(mockNeo4j.run).toHaveBeenCalledWith(expect.any(String), { id: 'u1' });
  });

  it('should call REL_ENROLLED_IN_CYPHER on enrollInCourse', async () => {
    await service.enrollInCourse('u1', 'c1');

    expect(mockNeo4j.run).toHaveBeenCalledWith(
      expect.any(String),
      { userId: 'u1', courseId: 'c1' },
    );
  });

  it('should call REL_UNENROLL_IN_CYPHER on unenrollInCourse', async () => {
    await service.unenrollInCourse('c1', 'u1');

    expect(mockNeo4j.run).toHaveBeenCalledWith(
      expect.any(String),
      { userId: 'u1', id: 'c1' },
    );
  });

  it('should call REL_REVIEWED_CYPHER on reviewCourse', async () => {
    await service.reviewCourse('u1', 'c1', 'r1', 5);

    expect(mockNeo4j.run).toHaveBeenCalledWith(
      expect.any(String),
      { userId: 'u1', courseId: 'c1', id: 'r1', rating: 5 },
    );
  });

  it('should call DETACH_REVIEW_CYPHER on deleteReview', async () => {
    await service.deleteReview('u1', 'c1');

    expect(mockNeo4j.run).toHaveBeenCalledWith(expect.any(String), { userId: 'u1', courseId: 'c1' });
  });

  it('should call REL_HAS_LESSON_CYPHER and REL_TEACHING_CYPHER on mergeLesson', async () => {
    const lesson = {
      _id: new Types.ObjectId(),
      title: 'Lesson 1',
      teacher: new Types.ObjectId(),
      course: new Types.ObjectId(),
    };

    await service.mergeLesson(lesson as any);

    // check dat MERGE_LESSON_CYPHER is aangeroepen
    expect(mockNeo4j.run).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ id: lesson._id.toString(), title: lesson.title }));

    // check dat addLessonToCourse en teachLesson is aangeroepen
    expect(mockNeo4j.run).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      courseId: lesson.course.toString(),
      lessonId: lesson._id.toString(),
    }));

    expect(mockNeo4j.run).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      userId: lesson.teacher.toString(),
      lessonId: lesson._id.toString(),
    }));
  });
});