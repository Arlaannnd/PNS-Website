const initialData = [];

let data = [];
if (typeof window !== 'undefined' && window.localStorage) {
  const storedData = localStorage.getItem('taskData');
  if (storedData) {
    data = JSON.parse(storedData);
  } else {
    data = [...initialData];
    localStorage.setItem('taskData', JSON.stringify(data));
  }
} else {
  data = [...initialData];
}

window.taskData = data;