let studentName = "";
let theta = 0.5;
let responses = [];
let answeredQuestions = [];
let currentQuestion = null;

const questions = [
    {id:1, topic:'Algebra', subtopic:'Linear', difficulty:0.3, text:'2x+4=10', options:{A:2,B:3,C:4,D:6}, answer:'B'},
    {id:2, topic:'Algebra', subtopic:'Linear', difficulty:0.5, text:'3x-7=11', options:{A:4,B:5,C:6,D:7}, answer:'C'},
    {id:3, topic:'Algebra', subtopic:'Quadratic', difficulty:0.8, text:'x²-5x+6=0', options:{A:'2,3',B:'1,6',C:'3,4',D:'2,4'}, answer:'A'},
    {id:4, topic:'Geometry', subtopic:'Triangles', difficulty:0.3, text:'Sum of angles in triangle?', options:{A:'90°',B:'180°',C:'270°',D:'360°'}, answer:'B'},
    {id:5, topic:'Geometry', subtopic:'Circles', difficulty:0.6, text:'Area of circle r=7?', options:{A:154,B:144,C:160,D:149}, answer:'A'},
    {id:6, topic:'Statistics', subtopic:'Mean', difficulty:0.4, text:'Mean of 2,4,6,8?', options:{A:4,B:5,C:6,D:7}, answer:'B'},
    {id:7, topic:'Statistics', subtopic:'Probability', difficulty:0.7, text:'Probability of heads tossing coin?', options:{A:1,B:0,C:0.5,D:0.25}, answer:'C'},
    {id:8, topic:'Geometry', subtopic:'Pythagoras', difficulty:0.85, text:'Hypotenuse of triangle sides 6 and 8?', options:{A:9,B:10,C:12,D:14}, answer:'B'}
];

function startTest(){
    studentName = document.getElementById('studentName').value.trim();
    if(!studentName){ alert('Enter your name'); return; }
    document.getElementById('loginDiv').style.display='none';
    document.getElementById('testDiv').style.display='block';
    responses = [];
    answeredQuestions = [];
    theta = 0.5;
    showNextQuestion();
}

function getNextQuestion(){
    const available = questions.filter(q=>!answeredQuestions.includes(q.id) && Math.abs(q.difficulty-theta)<=0.15);
    if(available.length===0) return null;
    return available[Math.floor(Math.random()*available.length)];
}

function showNextQuestion(){
    const q = getNextQuestion();
    if(!q){ showReport(); return; }
    currentQuestion = q;
    document.getElementById('questionText').textContent = q.text;
    const optsDiv = document.getElementById('options');
    optsDiv.innerHTML = "";
    for(const key in q.options){
        const btn = document.createElement('button');
        btn.textContent = key + ": " + q.options[key];
        btn.onclick = ()=>submitAnswer(key);
        optsDiv.appendChild(btn);
    }
    document.getElementById('currentQuestion').textContent = answeredQuestions.length + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('progress').style.width = (answeredQuestions.length/questions.length*100) + "%";
}

function submitAnswer(selected){
    answeredQuestions.push(currentQuestion.id);
    const correct = selected===currentQuestion.answer?'Y':'N';
    responses.push({question:currentQuestion, correct});
    theta += correct==='Y'?0.1:-0.1;
    theta = Math.max(0, Math.min(1, theta));
    showNextQuestion();
}

function showReport(){
    document.getElementById('testDiv').style.display='none';
    document.getElementById('reportDiv').style.display='block';

    // Save current attempt with all previous attempts
    const allAttempts = JSON.parse(localStorage.getItem('attempts')||'[]');
    let correctCount = responses.filter(r=>r.correct==='Y').length;
    let wrongCount = responses.filter(r=>r.correct==='N').length;
    allAttempts.push({
        student: studentName,
        responses: responses,
        total: responses.length,
        correct: correctCount,
        wrong: wrongCount
    });
    localStorage.setItem('attempts', JSON.stringify(allAttempts));

    // Show current test report by topic/subtopic
    const grouped = {};
    responses.forEach(r=>{
        const key = r.question.topic+"|"+r.question.subtopic;
        if(!grouped[key]) grouped[key]={topic:r.question.topic,subtopic:r.question.subtopic,total:0,correct:0};
        grouped[key].total++;
        if(r.correct==='Y') grouped[key].correct++;
    });
    const tbody = document.querySelector('#reportTable tbody');
    tbody.innerHTML = "";
    Object.values(grouped).forEach(g=>{
        const mastery = Math.round((g.correct/g.total)*100);
        const wrong = g.total - g.correct;
        const tr = document.createElement('tr');
        tr.className = mastery>=80?'high': mastery>=50?'medium':'low';
        tr.innerHTML=`<td>${g.topic}</td><td>${g.subtopic}</td><td>${g.total}</td><td>${g.correct}</td><td>${wrong}</td><td>${mastery}%</td>`;
        tbody.appendChild(tr);
    });

    // Display all previous attempts for all students
    displayAllPreviousAttempts();
}

function displayAllPreviousAttempts(){
    const allAttempts = JSON.parse(localStorage.getItem('attempts')||'[]');
    const div = document.getElementById('previousAttempts');
    div.innerHTML = "<h3>All Students Previous Attempts</h3>";
    if(allAttempts.length===0){ div.innerHTML+="No previous attempts"; return; }

    // Group by student
    const studentMap = {};
    allAttempts.forEach(a=>{
        if(!studentMap[a.student]) studentMap[a.student]=[];
        studentMap[a.student].push(a);
    });

    for(const student in studentMap){
        const attempts = studentMap[student];
        const studentDiv = document.createElement('div');
        studentDiv.innerHTML = `<h4>${student} (${attempts.length} attempts)</h4>`;
        attempts.forEach((att,i)=>{
            const p = document.createElement('p');
            p.textContent = `Attempt ${i+1}: Total ${att.total}, Correct ${att.correct}, Wrong ${att.wrong}`;
            studentDiv.appendChild(p);
        });
        div.appendChild(studentDiv);
    }
}