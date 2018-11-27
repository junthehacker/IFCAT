const models       = require('../../models');
const asyncForEach = require('../../utils/asyncForEach');

// Retrieve courses enrolled for student
exports.getCourses = (req, res) => {
    req.user.getCourses()
        .then(courses => {
            res.render('student/courses', {courses: courses});
        });
};

/**
 * Get all quizzes user has enrolled
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.getQuizzes = async (req, res, next) => {
    try {
        let tutorials   = await req.course.getTutorialsEnrolledByUser(req.user);
        let tutorialIds = tutorials.map(tutorial => tutorial.getId());

        // Find all quizzes user has that is published
        let tutorialQuizzes = await models.TutorialQuiz.find({
            tutorialId: {$in: tutorialIds}, published: true
        }).populate('quiz').exec();

        await asyncForEach(tutorialQuizzes, async tutorialQuiz => await tutorialQuiz.fillTutorialFromRemote());

        res.render('student/tutorial-quizzes', {
            course: req.course,
            tutorials,
            tutorialQuizzes
        });
    } catch (e) {
        next(e);
    }
};