import React, { useState, useEffect } from 'react';
import './App.css';
import './question.css';
import './loggedin.css';

const apiUrl = 'https://opentdb.com/api.php?amount=15';

function App() {
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timer, setTimer] = useState(30 * 60); // 30 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [attemptedQuestions, setAttemptedQuestions] = useState([]);

  useEffect(() => {
    // Fetch quiz questions from the API
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.results);
      })
      .catch((error) => console.error('Error fetching quiz questions:', error));
  }, []);

  useEffect(() => {
    // Start the quiz timer when the quiz starts
    let interval;
    if (quizStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      // Auto-submit the quiz when the timer reaches zero
      submitQuiz();
    }

    // Clear the timer interval when the component unmounts
    return () => clearInterval(interval);
  }, [quizStarted, timer]);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const selectAnswer = (answer) => {
    const updatedUserAnswers = [...userAnswers];
    updatedUserAnswers[currentQuestion] = answer;
    setUserAnswers(updatedUserAnswers);

    // Mark the current question as attempted
    if (!attemptedQuestions.includes(currentQuestion)) {
      setAttemptedQuestions([...attemptedQuestions, currentQuestion]);
    }
  };

  const navigateToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);

    // Mark the current question as visited
    if (!visitedQuestions.includes(questionIndex)) {
      setVisitedQuestions([...visitedQuestions, questionIndex]);
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitQuiz = () => {
    setQuizCompleted(true);
  };

  const renderQuizQuestions = () => {
    if (questions.length === 0) {
      return <p>Loading questions...</p>;
    }

    const currentQuestionData = questions[currentQuestion];

    return (
      <div>
        <h2>Question {currentQuestion + 1}</h2>
        <p>{currentQuestionData.question}</p>
        <form>
          {currentQuestionData.incorrect_answers.map((answer, index) => (
            <div key={index} className="answer-option">
              <input
                type="radio"
                id={`answer-${index}`}
                name="selected-answer"
                value={answer}
                onChange={() => selectAnswer(answer)}
                checked={userAnswers[currentQuestion] === answer}
              />
              <label htmlFor={`answer-${index}`}>{answer}</label>
            </div>
          ))}
          <div className="answer-option">
            <input
              type="radio"
              id="correct-answer"
              name="selected-answer"
              value={currentQuestionData.correct_answer}
              onChange={() => selectAnswer(currentQuestionData.correct_answer)}
              checked={userAnswers[currentQuestion] === currentQuestionData.correct_answer}
            />
            <label htmlFor="correct-answer">{currentQuestionData.correct_answer}</label>
          </div>
        </form>
        {currentQuestion < questions.length - 1 && (
          <button className="next-button" onClick={moveToNextQuestion}>
            Next
          </button>
        )}
      </div>
    );
  };

  const renderQuestionNavigation = () => {
    return (
      <div className="loggedin-question-navigation">
        <h3>Question Navigation</h3>
        <ul>
          {questions.map((_, index) => (
            <li
              key={index}
              onClick={() => navigateToQuestion(index)}
              className={`question-item ${index === currentQuestion ? 'current' : ''} ${
                visitedQuestions.includes(index) ? 'visited' : ''
              } ${
                attemptedQuestions.includes(index) ? 'attempted' : ''
              }`}
            >
              Question {index + 1}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderQuizReport = () => {
    return (
      <div className="loggedin1-container">
        <h2 className="quiz-title">Quiz Report</h2>
        <table className="quiz-report-table">
          <thead>
            <tr>
              <th>Question Number</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={index}>
                <td>Question {index + 1}: {question.question}</td>
                <td>{userAnswers[index]}</td>
                <td>{question.correct_answer}</td>
                 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`App ${quizStarted ? 'loggedin-background' : ''}`}>
      {!quizStarted && !quizCompleted && (
        <div className="container">
          <h1 className="welcome-header">Welcome to the Quiz</h1>
          <form>
            <label htmlFor="email">Enter your email:</label>
            <input
              type="email"
              id="email"
              className="email-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="button" className="start-quiz-button" onClick={startQuiz}>
              Start Quiz
            </button>
          </form>
        </div>
      )}
      {quizStarted && !quizCompleted && (
        <div className="loggedin-container">
          <div className="loggedin-question-navigation">
            {renderQuestionNavigation()}
          </div>
          <div className="windows">
            <p className="loggedin-timer">Time Remaining: {Math.floor(timer / 60)}:{timer % 60}</p>
            {renderQuizQuestions()}
            <button className="loggedin-submit-button" onClick={submitQuiz}>
              Submit Quiz
            </button>
            
          </div>
        </div>
      )}
      {quizCompleted && (
        <div className="loggedin-container">
          {renderQuizReport()}
          <p className="loggedin-quiz-completed-message">Quiz Completed!</p>
        </div>
      )}
    </div>
  );
}

export default App;
