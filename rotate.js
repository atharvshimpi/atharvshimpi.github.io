// Select DOM Items
const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');
const info = document.querySelector('.info');
const hid = document.querySelector('.hid');
const navItems = document.querySelectorAll('.nav-item');

// Set Initial State Of Menu
let showMenu = false;

burger.addEventListener('click', toggleMenu);

function toggleMenu() {
  if (!showMenu) {
    burger.classList.add('close');
    menu.classList.add('show');
    info.classList.add('show');
    hid.classList.add('show');
    navItems.forEach(item => item.classList.add('show'));

    // Set Menu State
    showMenu = true;
  } else {
    burger.classList.remove('close');
    menu.classList.remove('show');
    info.classList.remove('show');
    hid.classList.remove('show');
    navItems.forEach(item => item.classList.remove('show'));

    // Set Menu State
    showMenu = false;
  }
}