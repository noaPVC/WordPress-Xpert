window.onload = () => {
    // top level helpers
    const docId = (id) => document.getElementById(id)

    function setDisplay(element, state) {
        element.style.display = state
    }

    const mainGrid = docId('main_grid')
    const sideDrawer = docId('side_drawer')

    // login
    if (sessionStorage.getItem('token')) {
        setDisplay(docId('main-loader'), 'none')
        setDisplay(document.body, 'block')

        if (localStorage.getItem('sideDrawerState') === 'true') {
            sideDrawer.classList.toggle('active')
            mainGrid.classList.toggle('full')
            sideDrawerElementshandler()
        }

        const calenders = sessionStorage.getItem('calenders')
    } else logout()

    const extractTime = (dateInput) => {
        let data = new Date(dateInput)
        let hrs = data.getHours()
        let mins = data.getMinutes()
        if (hrs <= 9)
            hrs = '0' + hrs
        if (mins < 10)
            mins = '0' + mins
        const postTime = hrs + ':' + mins
        return postTime
    }

    const extractDate = (date) => new Date(date).toISOString().replace(/T.*/, '').split('-').join('-')

    const convertToDateStr = (date, time) => `${date}T${time}`

    const timesAreValid = (from, to) => {
        const fromHrs = parseInt(from.split(':')[0])
        const toHrs = parseInt(to.split(':')[0])
        const fromMins = parseInt(from.split(':')[1])
        const toMins = parseInt(to.split(':')[1])
        if (fromHrs <= toHrs && fromMins <= toMins) {
            return true
        }
        return false
    }

    // all constants

    // date picker navigation between months
    const previousNavigate = docId('navigate_before')
    const nextNavigate = docId('navigate_next')

    // nav bounds only
    const searchBtn = docId('search_btn')
    const searchInput = docId('search_input')
    const mobileNavDialog = docId('mobile_dialog')
    const profileNavDialog = docId('profile_dialog')
    const datePickerLabel = docId('current_month')

    // modals
    const profileModalElement = docId('profile_modal')
    const invitesModalElement = docId('invites_modal')

    const today = new Date()
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
    ]

    // date navigator
    const datesGrid = docId('date_navigator_elements')
    let concurrentDate = today

    //any JS here (after loader)
    const fullName = `${sessionStorage.getItem('lastname')} ${sessionStorage.getItem('firstname')}`
    const monthYear = `${months[today.getMonth()]} ${today.getFullYear()}`

    // assigning calendar values
    const calendar = new FullCalendar.Calendar(mainGrid, {
        firstDay: 1,
        locale: 'en-at',
        timeZone: 'UTC',
        expandRows: true,
        height: 'auto',
        headerToolbar: {
            left: 'title',
            center: '',
            right: 'timeGridDay,timeGridWeek,dayGridMonth,today,prev,next'
        },
        allDaySlot: false,
        initialView: 'dayGridMonth',
        selectable: false,
        nowIndicator: true,
        editable: true,
        eventMinHeight: 23,
        events: [],
        dateClick: (info) => handleDayClick(info),
        eventClick: (info) => handleEventClick(info),
        eventDidMount: (rightclickedElement) => {
            rightclickedElement.el.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                console.log(rightclickedElement)
            })
        },
        windowResize: () => calendar.updateSize()
    })

    function handleEventClick(info) {
        const eventData = {
            title: info.event.title,
            start: info.event.startStr,
            end: info.event.endStr,
            color: info.event.backgroundColor,
            eventProps: info.event._def.extendedProps
        }
        // later display in model etc.
        console.log(eventData)
    }

    // create element btn in sidenav 
    docId('create_element_btn').onclick = () => {
        sideDrawer.classList.toggle('active')
        mainGrid.classList.toggle('full')
        sideDrawerElementshandler()
        showEventDialog()
    }

    // create event ondayclick handling
    function handleDayClick(info) {
        calendar.addEvent({
            id: 'isEdit',
            title: '(No Title)',
            start: info.dateStr,
            end: info.dateStr,
            backgroundColor: '#3788d880'
        })

        eventDialog(info.date)
    }

    function eventDialog(date) {
        const extractedTime = extractTime(date)
        getFormDataEvent().date.value = extractDate(date)
        getFormDataEvent().from.value = extractedTime
        getFormDataEvent().to.value = extractedTime

        showEventDialog()
    }

    // submit event-element handler
    docId('submit_element').onclick = () => {
        const {
            title,
            description,
            date,
            from,
            to,
            color
        } = getFormDataEvent()

        let eventTitle = title.value == '' ? '(No Title)' : title.value
        let eventFrom = convertToDateStr(date.value, from.value)
        let eventTo = convertToDateStr(date.value, to.value)
        const eventType = getSelectedType()
        let event = {
            title: eventTitle,
            start: eventFrom,
            end: eventTo,
            type: eventType,
            tags: [],
            description: description.value,
            backgroundColor: color.value
        }
        // server
        // client
        // if type is 2 (task) there is no length, hence the start, end are equal
        if (eventType == 2) delete event.end
        else {
            if (!timesAreValid(from.value, to.value)) {
                // ui feedback
                return
            }
        }
        calendar.addEvent(event)
        closeEventDialog()
    }

    // close button event clicked
    docId('event_dialog_close').onclick = () => closeEventDialog()

    // event lifecycle methods
    const showEventDialog = () => {
        docId('event_dialog').classList.toggle('show')
        docId('event_title').focus()
    }

    function closeEventDialog() {
        const {
            title,
            description,
            date,
            from,
            to,
            color
        } = getFormDataEvent()
        title.value = ''
        description.value = ''
        date.value = '2022-01-01'
        from.value = '00:00'
        to.value = '00:00'
        color.value = '#09446A'

        if (calendar.getEventById('isEdit')) calendar.getEventById('isEdit').remove()
        docId('event_dialog').classList.toggle('show')
    }

    // get inputs directly
    const getFormDataEvent = () => {
        return {
            title: docId('event_title'),
            description: docId('event_description'),
            date: docId('event_date'),
            from: docId('time_from'),
            to: docId('time_to'),
            color: docId('colorinput')
        }
    }

    // event type selection handler
    docId('0').onclick = (e) => toggleSelectedEventType(e)
    docId('1').onclick = (e) => toggleSelectedEventType(e)
    docId('2').onclick = (e) => toggleSelectedEventType(e)

    const getSelectedType = () => {
        let id
        document.querySelectorAll('.event-type').forEach(type => {
            if (type.classList.contains('selected')) id = type.id
        })
        return id
    }

    function toggleSelectedEventType(e, src) {
        document.querySelectorAll('.event-type').forEach(type => type.classList.remove('selected'))
        e.srcElement.classList.add('selected')
        // toggling the form based on type of appointment
        if (e.srcElement.id == 0 || e.srcElement.id == 1) setDisplay(docId('timetoselect'), 'block')
        else setDisplay(docId('timetoselect'), 'none')
    }

    // colorspan selector
    const colorInput = docId('colorinput')
    docId('colorspan').onclick = () => colorInput.click()
    colorInput.onchange = () => {
        docId('colorspan').style.backgroundColor = colorInput.value
    }

    // reset possible active menus etc. on resize
    window.onresize = () => {
        removeActiveDialogs()
        setDisplay(searchBtn, 'block')

        // on resizing handle side drawer
        if (sideDrawer.classList.contains('active') && window.innerWidth <= 501) setDisplay(mainGrid,
            'none')
        else setDisplay(mainGrid, 'block')
    }

    window.onmouseup = (e) => {
        const nodeList = [docId('profile_dialog'), docId('mobile_dialog')]

        nodeList.forEach(node => {
            if (e.target != node || e.target.parent != node) {
                removeActiveDialogs()
            }
        })
    }

    // setting important live elements on page
    docId('name_of_user').textContent = fullName
    docId('dialog_name').textContent = fullName
    datePickerLabel.textContent = monthYear

    // sidebar slide drawer
    docId('menu_btn').onclick = () => {
        const calendarTitle = docId('fc-dom-1')
        sideDrawer.classList.toggle('active')
        if (sideDrawer.classList.contains('active')) {
            setDisplay(calendarTitle, 'none')
        } else {
            if (!(window.innerWidth <= 500))
                setDisplay(calendarTitle, 'block')
        }

        mainGrid.classList.toggle('full')
        localStorage.setItem('sideDrawerState', sideDrawer.classList.contains('active') ? true :
            false)
        sideDrawerElementshandler()
    }

    function sideDrawerElementshandler() {
        if (sideDrawer.classList.contains('active') && window.innerWidth <= 500)
            setDisplay(mainGrid, 'none')
        else
            setTimeout(() => setDisplay(mainGrid, 'block'), 150);
    }

    // remove active dialogs
    function removeActiveDialogs() {
        profileNavDialog.classList.remove('show')
        mobileNavDialog.classList.remove('show')
        setDisplay(searchInput, 'none')
    }

    docId('exp_more_profile_btn').onclick = () => {
        profileNavDialog.classList.toggle('show')
    }

    docId('show_more_nav').onclick = () => mobileNavDialog.classList.toggle('show')

    searchBtn.onclick = () => {
        setDisplay(searchBtn, 'none')
        setDisplay(searchInput, 'block')
        searchInput.focus()
    }

    // mobile functionality (links, btns)
    docId('search_link').onclick = () => {
        mobileNavDialog.classList.remove('show')
        setDisplay(searchInput, 'block')
        searchInput.focus()
    }

    searchInput.addEventListener('focusout', destroySearchBar)

    searchInput.onkeypress = (e) => {
        e = e || window.event
        if (e.keyCode == 13) {
            destroySearchBar()
            searchInput.value = ''
            // some api calls
        }
    }

    function destroySearchBar() {
        setDisplay(searchBtn, 'block')
        setDisplay(searchInput, 'none')
    }

    function openModal(modal) {
        mobileNavDialog.classList.remove('show')
        profileNavDialog.classList.remove('show')
        modal.classList.toggle('show')
    }

    function activateSettings() {
        mobileNavDialog.classList.remove('show')
        profileNavDialog.classList.remove('show')
        docId('settings_screen').classList.toggle('active')
    }

    function logout() {
        sessionStorage.clear()
        // window.location = '/login.html'
        window.location = 'https://xpert.emnichtda.de/'
    }

    docId('profile_close_modal').onclick = () => profileModalElement.classList.remove(
        'show')
    docId('invites_close_modal').onclick = () => invitesModalElement.classList.remove(
        'show')

    // assign modal handlers 
    docId('profile_link').onclick = () => openModal(profileModalElement)
    docId('profile_mobile_link').onclick = () => openModal(profileModalElement)

    docId('invites_btn').onclick = () => openModal(invitesModalElement)
    docId('invites_mobile_link').onclick = () => openModal(invitesModalElement)

    // settings
    docId('settings_link').onclick = () => activateSettings()
    docId('settings_mobile_link').onclick = () => activateSettings()

    docId('close_settings').onclick = () => docId('settings_screen')
        .classList.toggle('active')

    // logout
    docId('logout_link').onclick = () => logout()
    docId('logout_mobile_link').onclick = () => logout()

    function getDatepickerDates(month, year) {
        let days = [] // active days in between
        let daysBefore = 0 // elapsed before
        let daysAfter = 0 // elapsed after

        // getting amount of elapsed days
        if (month == 4) {
            days = getDaysInMonth(4, year)
            daysBefore = days[0].getDay() + 6
            daysAfter = 42 - (days.length + daysBefore)
        } else {
            days = getDaysInMonth(month, year)
            daysBefore = days[0].getDay() - 1
            daysAfter = 42 - (days.length + daysBefore)
        }

        const firstDay = days[0]
        const lastDay = days[days.length - 1]
        // concating
        const daysArrayBefore = getDaysInRangeOfDate(firstDay, daysBefore, false).reverse()
        const daysArrayAfter = getDaysInRangeOfDate(lastDay, daysAfter, true)
        return {
            dates: days,
            datesBefore: daysArrayBefore,
            datesAfter: daysArrayAfter
        }
    }

    function dateEqualToday(datePassed) {
        const date = new Date(datePassed)
        const today = new Date()

        if (date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear())
            return true
        return false
    }

    function getDaysInMonth(month, year) {
        let date = new Date(year, month, 1);
        let days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    function getDaysInRangeOfDate(date, days, increment) {
        let daysArray = []
        let currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        for (let i = 0; i < days; i++) {
            if (!increment) currentDate.setDate(currentDate.getDate() - 1)
            else currentDate.setDate(currentDate.getDate() + 1)
            daysArray.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate
                .getDate()))
        }
        return daysArray
    }

    // populate datepicker
    function loadDatePickerElements(month, year) {
        // clear previous grid
        datesGrid.innerHTML = ''
        const {
            datesBefore,
            datesAfter,
            dates
        } = getDatepickerDates(month, year)

        datesBefore.forEach(date => createDateElement(date, 'elapsed'))
        dates.forEach(date => createDateElement(date, dateEqualToday(date) ? 'current' : 'none'))
        datesAfter.forEach(date => createDateElement(date, 'elapsed'))
    }

    function createDateElement(date, type) {
        const dateEl = document.createElement('span')
        dateEl.classList.add(type)
        dateEl.textContent = date.getDate()
        dateEl.onclick = () => {
            datesGrid.childNodes.forEach(n => n.classList.remove('selected'))
            dateEl.classList.add('selected')
            calendar.gotoDate(new Date(date).setDate(date.getDate() + 1))
            calendar.changeView('timeGridDay')
        }
        addNewDate(dateEl)
    }

    function addNewDate(element) {
        if (datesGrid.childNodes.length == 42) return
        datesGrid.append(element)
    }

    function setConcurrentMonth(next) {
        if (next)
            concurrentDate.setMonth(concurrentDate.getMonth() + 1)
        else
            concurrentDate.setMonth(concurrentDate.getMonth() - 1)

        const monthYearTxt = `${months[concurrentDate.getMonth()]} ${concurrentDate.getFullYear()}`
        datePickerLabel.textContent = monthYearTxt
        loadDatePickerElements(concurrentDate.getMonth(), concurrentDate.getFullYear())
    }

    previousNavigate.addEventListener('click', () => setConcurrentMonth(false))
    nextNavigate.addEventListener('click', () => setConcurrentMonth(true))

    // expand calenders listing
    docId('my_calenders').onclick = () => toggleCalenderExpand('expand1', document
        .getElementById('expand1_calender'))
    docId('other_calenders').onclick = () => toggleCalenderExpand('expand2', document
        .getElementById('expand2_calender'))

    function toggleCalenderExpand(expandSelector, children) {
        const expandIcon = docId(expandSelector)
        if (expandIcon.innerHTML == 'expand_more') {
            expandIcon.innerHTML = 'expand_less'
            children.style.display = 'flex'
        } else {
            expandIcon.innerHTML = 'expand_more'
            children.style.display = 'none'
        }
    }

    document.querySelectorAll('.calender').forEach(calender => calender.addEventListener('click', e => e
        .stopPropagation()))

    // initial date load
    loadDatePickerElements(today.getMonth(), today.getFullYear())
    calendar.render()

    function requestRefreshToken() {
        const data = JSON.stringify({
            "accessToken": sessionStorage.getItem('token'),
            "refreshToken": sessionStorage.getItem('refreshToken')
        })

        const options = {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: data,
            redirect: 'follow'
        }

        fetch('https://xpertcalendarapi.azurewebsites.net/api/user/refreshtokens', options)
            .then(resp => resp.json())
            .then(response => {
                sessionStorage.setItem('token', response.accessToken)
                sessionStorage.setItem('refreshToken', response.refreshToken)
            })
            .catch(err => console.error(err))
    }

    // in order for the calender to stay responsive through out its lifecycle
    setInterval(() => calendar.updateSize(), 50);

    // refresh token in interval of 5 mins
    setInterval(() => requestRefreshToken(), 300000);
}