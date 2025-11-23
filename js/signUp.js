/*
========================================
    SignUp Page JS - app.js
========================================
*/


let userName = document.getElementById('userName')
let firstName = document.getElementById('firstName')
let lastName = document.getElementById('lastName')
let email = document.getElementById('email')
let password = document.getElementById('password')
let cPassword = document.getElementById('cPassword')

let signBtn = document.getElementById('signUpBtn')

signBtn.addEventListener('click', () => {

    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || []
    
    if (!userName.value || !firstName.value || !lastName.value || !email.value || !password.value || !cPassword.value) {
        return alert('All fields are required');
    }

    if (password.value !== cPassword.value) {
        return alert('Passwords do not match');
    }
    let emailCheck = email.value.sprit()
    if(!emailCheck.includes('@')) {
        return alert("plz Email me @ put Karen")
    }

    if (password.value.length < 8) return alert('Minimum length of passsoword should be 8 characters long')

    let userNameAlreadyExists = allUsers.find((userData) => {
        return userData.userName.toLowerCase() == userName.value.trim().toLowerCase()
    })
    
    let emailAlreadyExists = allUsers.find((userData) => {
        return userData.email == email.value
    })

    if (userNameAlreadyExists) return alert('User Name already taken, try another')
    
    if (emailAlreadyExists) return alert('Email already taken, try another')

    let userDetail = {
        userName: userName.value,
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value
    }

    allUsers.push(userDetail)

    localStorage.setItem('allUsers', JSON.stringify(allUsers))

    window.location = '/pages/login.html'
})
