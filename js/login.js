document.getElementById('main-loader').style.display = 'none'

const emailInput = document.getElementById('email_input')
const passwordInput = document.getElementById('password_input')
const feedbackLabel = document.querySelector('.user-feedback')

document.getElementById('credentials_login').onclick = () => {
    if (validateInputs()) {
        issueLogin()
    }
}

function issueLogin() {
    const data = JSON.stringify({
        "email": emailInput.value,
        "password": passwordInput.value
    })

    const options = {
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },
        body: data,
        redirect: 'follow'
    }

    fetch('https://xpertcalendarapi.azurewebsites.net/api/user/login', options)
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
        .catch(error => feedback(true, 'Incorrect username or password.'))
}

function validateInputs() {
    const email = emailInput.value
    const pass = passwordInput.value
    if (!email || !pass || email == '' || pass == '') {
        feedback(true, 'Please fill all inputs!')
        return false
    }
    if (!email.includes('@') || email.length <= 5) {
        feedback(true, 'Seems like an invalid email.')
        return false
    }
    return true
}

function feedback(isFeedback, message) {
    feedbackLabel.textContent = message
    if (isFeedback)
        feedbackLabel.style.visibility = 'visible'
    else
        feedbackLabel.style.visibility = 'hidden'
}