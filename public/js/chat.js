const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')
const $messageButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')
const $locationButton = document.querySelector('#location')



//templates
const messageTemplate =document.querySelector("#template").innerHTML
const locationTemplate = document.querySelector("#locationTemplate").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//##############################AUTOSCROLL FUNCTION############################################


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('locationMessage', (location) => {
    console.log(location) 

    const html = Mustache.render(locationTemplate, {
        location: location.url,
        username: location.username,
        time: moment(location.createdAt).format('h:mm:ss A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        username: message.username,
        time: moment(message.createdAt).format('h:mm:ss A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomdata', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

//disabling button

    $messageButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

//enabling button
        $messageButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log("Delivered")
    })
})

document.querySelector('#location').addEventListener('click', () => {
    

    if (!navigator.geolocation) {
        return alert('Your browser doesnt support')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude
        socket.emit('location', { latitude: lat, longitude: long}, (status) => {

            $locationButton.removeAttribute('disabled')

            console.log('Location sent successfully', status)
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert (error)
        location.href = '/'
    }
})