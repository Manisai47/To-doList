let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let activity = JSON.parse(localStorage.getItem("activity")) || {};
let streak = JSON.parse(localStorage.getItem("streak")) || {count:0,lastDate:null};

// LOGIN
function login(){
  localStorage.setItem("user", username.value);
  loginScreen.style.display="none";
}
if(localStorage.getItem("user")) loginScreen.style.display="none";

// IST DATE
function getISTDate(){
  return new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"});
}

// CLOCK + DATE
function updateClock(){
  let now = new Date();

  clock.textContent = "🇮🇳 " + now.toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata"});
  date.textContent = now.toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata"});

  taskDate.value = getISTDate();
}
setInterval(updateClock,1000);
updateClock();

// ADD TASK
function addTask(){
  if(!taskInput.value) return;

  tasks.push({
    text:taskInput.value,
    priority:priority.value,
    date:taskDate.value,
    reminder:reminderTime.value,
    done:false
  });

  taskInput.value="";
  render();
}

// TOGGLE TASK
function toggleTask(i){
  tasks[i].done=!tasks[i].done;

  let d = tasks[i].date;

  if(!activity[d]) activity[d]=0;

  activity[d] += tasks[i].done ? 1 : -1;
  if(activity[d]<0) activity[d]=0;

  localStorage.setItem("activity",JSON.stringify(activity));
  render();
}

// DELETE
function deleteTask(i){
  tasks.splice(i,1);
  render();
}

// RENDER
function render(){
  taskList.innerHTML="";

  tasks.forEach((t,i)=>{
    let div=document.createElement("div");
    div.className="task";

    div.innerHTML=`
      <span class="${t.done?'completed':''}">
        ${t.text} (${t.priority}) - ${t.date}
      </span>
      <div>
        <button onclick="toggleTask(${i})">✔</button>
        <button onclick="deleteTask(${i})">❌</button>
      </div>
    `;

    taskList.appendChild(div);
  });

  updateStreak();
  renderHeatmap();
  updateAIAdvisor();

  localStorage.setItem("tasks",JSON.stringify(tasks));
}

// STREAK
function updateStreak(){
  let today=getISTDate();
  let doneToday=tasks.some(t=>t.done && t.date===today);

  if(!doneToday){
    streakText.textContent=`${streak.count} days`;
    return;
  }

  if(streak.lastDate!==today){
    let y=new Date();
    y.setDate(y.getDate()-1);

    let yDate=y.toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"});

    streak.count = (streak.lastDate===yDate) ? streak.count+1 : 1;
    streak.lastDate=today;
  }

  localStorage.setItem("streak",JSON.stringify(streak));
  streakText.textContent=`🔥 ${streak.count} day streak`;
}

// HEATMAP
function renderHeatmap(){
  heatmap.innerHTML="";

  let today=new Date();

  for(let i=364;i>=0;i--){
    let d=new Date();
    d.setDate(today.getDate()-i);

    let dateStr=d.toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"});
    let count=activity[dateStr]||0;

    let level=0;
    if(count>0) level=1;
    if(count>=2) level=2;
    if(count>=4) level=3;
    if(count>=6) level=4;

    let div=document.createElement("div");
    div.className=`day level-${level}`;
    div.title=`${dateStr}: ${count} tasks`;

    heatmap.appendChild(div);
  }
}

// AI ADVISOR
function updateAIAdvisor(){
  let done = tasks.filter(t=>t.done).length;
  let total = tasks.length;
  let hour = new Date().getHours();

  let msg = "";

  if(total===0) msg="📌 Add your first task.";
  else if(done===0) msg="🚨 Start working now.";
  else if(done<total) msg="🔥 Finish what you started.";
  else msg="🏆 A Better Tomorrow awaits you.";

  if(streak.count>=3) msg=`🔥 ${streak.count} day streak. Keep going!`;
  if(streak.count>=7) msg="🚀 You're unstoppable.";

  aiText.textContent = msg;
}

setInterval(updateAIAdvisor,10000);

// PARTICLES
tsParticles.load("tsparticles",{
  particles:{
    number:{value:50},
    size:{value:2},
    move:{enable:true,speed:1},
    links:{enable:true,color:"#8b5cf6"},
    color:{value:"#38bdf8"}
  }
});

// INIT
render();