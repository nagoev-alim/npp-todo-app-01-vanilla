// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import { uid } from './modules/uid.js';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='todo'>
    <header>
      <h2 class='title'>Todo</h2>
      <p>You have <span class='h6' data-count=''>0</span> items</p>
      <button class='hide' data-clear=''>Clear Completed</button>
    </header>

    <form data-form=''>
      <label>
        <input type='text' name='todo' placeholder='Enter task name'>
      </label>
    </form>

    <div class='content hide'>
      <label>
        <input type='text' data-filter='' placeholder='Filter tasks'>
      </label>
      <ul data-todos=''></ul>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      form: document.querySelector('[data-form]'),
      list: document.querySelector('[data-todos]'),
      clear: document.querySelector('[data-clear]'),
      filter: document.querySelector('[data-filter]'),
      counter: document.querySelector('[data-count]'),
    };

    this.storageDisplay();

    this.DOM.form.addEventListener('submit', this.onSubmit);
    this.DOM.list.addEventListener('click', this.onDelete);
    this.DOM.list.addEventListener('change', this.onChange);
    this.DOM.list.addEventListener('dblclick', this.onUpdate);
    this.DOM.filter.addEventListener('input', this.onFilter);
    this.DOM.clear.addEventListener('click', this.onClear);
  }

  /**
   * @function storageGet - Get data from local storage
   * @returns {any|*[]}
   */
  storageGet = () => {
    return localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
  };

  /**
   * @function storageAdd - Save data to storage
   * @param data
   */
  storageAdd = (data) => {
    return localStorage.setItem('todos', JSON.stringify(data));
  };

  /**
   * @function storageDisplay - Get and display data from local storage
   */
  storageDisplay = () => {
    this.todos = this.storageGet();
    this.renderTodos(this.todos);
  };

  /**
   * @function onSubmit - Form submit handler
   * @param event
   */
  onSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const label = Object.fromEntries(new FormData(form).entries()).todo.trim();

    if (label.length === 0) {
      showNotification('warning', 'Please fill the field.');
      return;
    }

    form.reset();

    this.todos = [...this.todos, { label, complete: false, id: uid() }];
    this.renderUI(this.todos);
  };

  /**
   * @function renderUI - Rerender UI
   */
  renderUI = (data) => {
    this.storageAdd(data);
    this.renderTodos(data);
  };

  /**
   * @function renderTodos - Render HTML
   * @param data
   */
  renderTodos(data) {
    document.querySelector('.content').className = `${data.length === 0 ? 'content hide' : 'content'}`;
    this.DOM.list.innerHTML = `
      ${data.map(({ complete, label, id }) => `
        <li class='${complete ? 'complete' : ''}'>
          <label for='todo-${id}'>
            <input class='visually-hidden' type='checkbox' data-input='${id}' id='todo-${id}' ${complete ? 'checked' : ''}>
            <span class='checkbox'></span>
          </label>
          <span data-label='${id}'>${label}</span>
          <button data-id='${id}'>${feather.icons.x.toSvg()}</button>
        </li>
      `).join('')}`;

    this.DOM.filter.style.display = data.length > 0 ? 'block' : 'none';
    this.DOM.counter.innerText = data.filter((todo) => !todo.complete).length;
    this.DOM.clear.className = data.filter((todo) => todo.complete).length ? '' : 'hide';
  }

  /**
   * @function onDelete - Delete task event handler
   * @param target
   */
  onDelete = ({ target }) => {
    if (!target.matches('[data-id]')) {
      return;
    }

    const id = target.dataset.id;
    const label = this.todos.filter(todo => todo.id === id)[0].label;

    if (window.confirm(`Delete ${label}?`)) {
      this.todos = this.todos.filter(todo => todo.id !== id);
      this.renderUI(this.todos);
    }
  };

  /**
   * @function onChange - Task complete status change handler
   * @param target
   */
  onChange = ({ target: { dataset: { input: id }, checked } }) => {
    this.todos = this.todos.map(todo => todo.id === id ? { ...todo, complete: checked } : todo);
    this.renderUI(this.todos);
  };

  /**
   * @function onUpdate - Update task content handler
   * @param target
   */
  onUpdate = ({ target }) => {
    if (!target.matches('[data-label]')) {
      return;
    }

    const id = target.dataset.label;
    const currentLabel = this.todos.filter(todo => todo.id === id)[0].label;
    const input = document.createElement('input');
    input.classList.add('edit');
    input.type = 'text';
    input.value = currentLabel;
    target.after(input);
    target.classList.add('hide');

    input.addEventListener('change', (event) => {
      event.stopPropagation();
      const label = event.target.value;

      if (label !== currentLabel) {
        this.todos = this.todos.map(todo => todo.id === id ? { ...todo, label } : todo);
        this.renderUI(this.todos);
      }
      event.target.style.display = '';
      input.remove();
    });

    input.focus();
  };

  /**
   * @function onFilter - Filter tasks event handler
   * @param value
   */
  onFilter = ({ target: { value } }) => {
    return Array.from(this.DOM.list.children).forEach(todo =>
      todo.style.display = todo.querySelector('[data-label]').textContent
        .toLowerCase()
        .indexOf(value.trim().toLowerCase()) !== -1 ? 'flex' : 'none',
    );
  };

  /**
   * @function onClear - Clear tasks event handler
   */
  onClear = () => {
    const count = this.todos.filter(({ complete }) => complete).length;

    if (count === 0) {
      return;
    }

    if (window.confirm(`Delete ${count} completed items?`)) {
      this.todos = this.todos.filter(({ complete }) => !complete);
      this.renderUI(this.todos);
    }
  };
}

// ⚡️Class instance
new App();
