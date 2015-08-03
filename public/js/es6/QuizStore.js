// The store responds to events from the actions.
class QuizStore {
  constructor() {
    this.quiz = [];
    // Bind our action handler to the action.
    this.bindAction(quizActions.updateQuiz, this.updateQuiz);
  }
  updateQuiz(quiz) {
    quiz.shift();
    this.quiz = quiz;
    // Optionally return false to suppress the change event to this.students by returning false.
  }
}