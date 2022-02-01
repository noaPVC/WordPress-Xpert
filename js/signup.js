document.getElementById('main-loader').style.display = 'none'
const feedbackLabel = document.getElementById('span_user_feedback')

// inputs
const lastnameInput = document.getElementById('lastname_input')
const firstnameInput = document.getElementById('firstname_input')
const emailInput = document.getElementById('email_input')
const passInput = document.getElementById('pass_input')
const confirmPassInput = document.getElementById('confirm_pass_input')

// next btn pressed
document.getElementById('btn_next_step').onclick = () => {
    if (validateInputs()) {
        // send request to backend to validate
        document.querySelector('.step1').style.display = 'none'
        document.querySelector('.step2').style.display = 'flex'
    }
}

document.getElementById('back_step').onclick = () => {
    document.querySelector('.step1').style.display = 'flex'
    document.querySelector('.step2').style.display = 'none'
}

document.getElementById('signup').onclick = () => {
    issueSignUp()
}

function issueSignUp() {
    const data = JSON.stringify({
        "firstname": firstnameInput.value,
        "lastname": lastnameInput.value,
        "email": emailInput.value,
        "password": passInput.value
    })

    const options = {
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },
        body: data,
        redirect: 'follow'
    }

    fetch('https://xpertcalendarapi.azurewebsites.net/api/user/register', options)
        .then(resp => resp.json())
        .then(response => {
            feedback(false, null)
            sessionStorage.setItem('uid', response.userID)
            sessionStorage.setItem('firstname', response.firstname)
            sessionStorage.setItem('lastname', response.lastname)
            sessionStorage.setItem('calenders', JSON.stringify(response.calendars))
            sessionStorage.setItem('token', response.accessToken)
            sessionStorage.setItem('refreshToken', response.refreshToken)
            // window.location = '/calender.html'
            window.location = '/?page_id=167'
        })
        .catch(error => feedback(true, 'Some error occured, try again later'))
}

function validateInputs() {
    const lastname = lastnameInput.value
    const firstname = firstnameInput.value
    const email = emailInput.value
    const pass = passInput.value
    const confirmPass = confirmPassInput.value

    if (lastname == '' || firstname == '' || email == '' || pass == '' || confirmPass == '') {
        feedback(true, 'Please fill all inputs!')
        return false
    }
    if (!email.includes('@') || email.length <= 5 || !email.includes('.com')) {
        feedback(true, 'Seems like an invalid email.')
        return false
    }
    if (pass !== confirmPass) {
        feedback(true, 'Password and confirmation unequal!')
        return false
    }
    feedback(false, null)
    return true
}

document.getElementById('showpass_check').onchange = () => {
    const passInput = document.getElementById('pass_input')
    const confirmPassInput = document.getElementById('confirm_pass_input')

    if (document.getElementById('showpass_check').checked) {
        passInput.type = 'text'
        confirmPassInput.type = 'text'
    } else {
        passInput.type = 'password'
        confirmPassInput.type = 'password'
    }
}

function feedback(isFeedback, message) {
    feedbackLabel.textContent = message
    if (isFeedback)
        feedbackLabel.style.visibility = 'visible'
    else
        feedbackLabel.style.visibility = 'hidden'
}