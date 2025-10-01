import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../connections/config';
import EmpSelect from '../components/EmpSelect';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        // Initialize answers object
        const initialAnswers = {};
        data.forEach(question => {
          if (question.type === 'multiple_choice') {
            initialAnswers[question.question] = [];
          } else {
            initialAnswers[question.question] = '';
          }
        });
        setAnswers(initialAnswers);
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      setError('Error loading questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChoice = (question, answer) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleMultipleChoice = (question, answer, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[question] || [];
      if (checked) {
        return {
          ...prev,
          [question]: [...currentAnswers, answer]
        };
      } else {
        return {
          ...prev,
          [question]: currentAnswers.filter(a => a !== answer)
        };
      }
    });
  };

  const validateSubmission = () => {
    if (!user || user.trim() === '') {
      return 'Please enter your name.';
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[question.question];
      if (question.type === 'multiple_choice') {
        if (!answer || answer.length === 0) {
          // Scroll to the unanswered question
          document.getElementById(`question${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return 'Answer all questions.';
        }
      } else {
        if (!answer || answer.trim() === '') {
          // Scroll to the unanswered question
          document.getElementById(`question${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return 'Answer all questions.';
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateSubmission();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const submission = questions.map(question => ({
        Question: question.question,
        Answer: Array.isArray(answers[question.question]) 
          ? answers[question.question].join('~;~')
          : answers[question.question],
        User: user
      }));

      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user,
          questions: submission
        }),
      });

      if (response.ok) {
        setSuccess('Assessment submitted successfully!');
        // Reset form
        setUser('');
        const initialAnswers = {};
        questions.forEach(question => {
          if (question.type === 'multiple_choice') {
            initialAnswers[question.question] = [];
          } else {
            initialAnswers[question.question] = '';
          }
        });
        setAnswers(initialAnswers);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit assessment');
      }
    } catch (err) {
      setError('Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const shouldShowImage = (questionIndex) => {
    // Get the question number from the question text (e.g., "26 - What is...")
    const questionNumber = parseInt(questions[questionIndex].question.split(' - ')[0]);
    return [26, 32, 33, 34, 35, 36, 37, 38, 39].includes(questionNumber);
  };

  const getImagePath = (questionIndex) => {
    // Get the question number from the question text
    const questionNumber = parseInt(questions[questionIndex].question.split(' - ')[0]);
    return `/orientationassessment/resources/Q${questionNumber}.png`;
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Orientation Assessment
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Please complete all questions below. All questions are required.
          </p>
        </div>

        {/* User Input Field */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <label htmlFor="user" className="block text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Name:
            </label>
            {/* <input
              type="text"
              id="user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="FirstName LastName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            /> */}
            <EmpSelect
              defaultValue={user}
              onChange={(value) => setUser(value)}
              viewOnly={false}
            />
          </div>
        </div>

        {/* Error and Success Notifications */}
        {error && (
          <div 
            className="fixed top-24 right-4 z-50"
            onClick={() => setError('')}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border-l-4 border-red-500 flex items-center space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div 
            className="fixed top-24 right-4 z-50"
            onClick={() => setSuccess('')}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border-l-4 border-green-500 flex items-center space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-green-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{success}</p>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="max-w-4xl mx-auto space-y-8">
          {questions.map((question, index) => (
            <div key={index} id={`question${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {/* Image for specific questions */}
              {shouldShowImage(index) && (
                <div className="mb-4">
                  <img 
                    src={getImagePath(index)} 
                    alt={`Question ${index + 1}`}
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {question.question}
              </h3>

              {question.type === 'single_choice' ? (
                <div className="space-y-3">
                  {question.answers.map((answer, answerIndex) => (
                    <label key={answerIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`answer${index}`}
                        value={answer.answer}
                        checked={answers[question.question] === answer.answer}
                        onChange={() => handleSingleChoice(question.question, answer.answer)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{answer.answer}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {question.answers.map((answer, answerIndex) => (
                    <label key={answerIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        value={answer.answer}
                        checked={answers[question.question]?.includes(answer.answer) || false}
                        onChange={(e) => handleMultipleChoice(question.question, answer.answer, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{answer.answer}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-300">
            {Object.values(answers).filter(answer => 
              Array.isArray(answer) ? answer.length > 0 : answer && answer.trim() !== ''
            ).length} of {questions.length} questions answered
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
