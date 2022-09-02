/* eslint-disable */
import axios from 'axios';

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http:/127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    console.log(res);
    if (res.data.status === 'success') {
      alert('success Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert('error', err.response.data.message);
    // console.log(err);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
