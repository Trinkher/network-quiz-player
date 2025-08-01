// Load questions from JSON and initialize the quiz
document.addEventListener('DOMContentLoaded', () => {
  fetch('quiz.json')
    .then(response => response.json())
    .then(data => {
      // Shuffle questions for each session so they appear in a random order
      window.questionList = shuffleArray(data);
      window.currentIndex = 0;
      displayQuestion();
    })
    .catch(err => {
      document.getElementById('quiz').innerHTML = 'Failed to load questions.';
      console.error(err);
    });
});

// Utility to shuffle an array in place using Fisher–Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function displayQuestion() {
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';
  const progressElem = document.getElementById('progress');
  // Update progress bar
  if (progressElem && window.questionList) {
    const percent = window.currentIndex / window.questionList.length * 100;
    progressElem.style.width = percent + '%';
  }
  // Check if quiz is finished
  if (!window.questionList || window.currentIndex >= window.questionList.length) {
    quizDiv.textContent = 'Quiz complete!';
    if (progressElem) progressElem.style.width = '100%';
    return;
  }
  const q = window.questionList[window.currentIndex];
  // Create question container
  const qContainer = document.createElement('div');

  // Question text
  const qText = document.createElement('div');
  qText.className = 'question';
  qText.textContent = `Question ${window.currentIndex + 1}/${window.questionList.length}: ${q.question}`;
  qContainer.appendChild(qText);

  // Choices
  const choicesList = document.createElement('ul');
  choicesList.className = 'choices';
  const multipleCorrect = q.correct && q.correct.length > 1;
  // Render each option; if no explicit letters or choices, show full text as static paragraph
  if (q.letters && q.choices && q.letters.length === q.choices.length && q.letters.length > 0) {
    // Combine letters and choices into objects and shuffle them
    const optionPairs = q.letters.map((letter, idx) => ({ letter: letter, text: q.choices[idx] }));
    shuffleArray(optionPairs);
    optionPairs.forEach(pair => {
      const li = document.createElement('li');
      const input = document.createElement('input');
      input.type = multipleCorrect ? 'checkbox' : 'radio';
      input.name = 'choice';
      input.value = pair.letter;
      input.id = `q${q.id}_${pair.letter}`;
      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.textContent = `${pair.letter}. ${pair.text}`;
      li.appendChild(input);
      li.appendChild(label);
      choicesList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = q.question;
    choicesList.appendChild(li);
  }
  qContainer.appendChild(choicesList);

  // Feedback area
  const feedback = document.createElement('div');
  feedback.className = 'feedback';
  qContainer.appendChild(feedback);

  // Controls
  const controls = document.createElement('div');
  controls.id = 'controls';

  const checkBtn = document.createElement('button');
  checkBtn.textContent = 'Check Answer';
  checkBtn.onclick = () => {
    // Gather selected letters
    const selected = [];
    const inputs = choicesList.querySelectorAll('input');
    inputs.forEach(inp => {
      if (inp.checked) selected.push(inp.value);
    });
    const correctAnswers = q.correct || [];
    const corrSorted = correctAnswers.slice().sort();
    selected.sort();
    if (selected.length === 0) {
      feedback.textContent = 'Please select at least one option.';
      feedback.style.color = 'orange';
      return;
    }
    if (selected.join('|') === corrSorted.join('|')) {
      feedback.textContent = 'Correct!';
      feedback.style.color = 'green';
    } else {
      feedback.textContent = `Incorrect. Correct answer: ${corrSorted.join(', ') || 'Not provided'}`;
      feedback.style.color = 'red';
    }
    // Optionally disable check button to prevent multiple submissions
    checkBtn.disabled = true;
  };
  controls.appendChild(checkBtn);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.style.marginLeft = '10px';
  nextBtn.onclick = () => {
    window.currentIndex++;
    displayQuestion();
  };
  controls.appendChild(nextBtn);

  qContainer.appendChild(controls);

  quizDiv.appendChild(qContainer);
}
