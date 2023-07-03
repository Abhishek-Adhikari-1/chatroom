const socket = io();
const loader = document.getElementById("loader");
const loginSection = document.getElementById("login");
const chatSection = document.getElementById("chatSection");
const nameInput = document.getElementById("nameInput");
let sendButton = document.getElementById("send");
const photo = document.getElementById("photo");
const photoInput = document.getElementById("photoInput");

let user;
var profile;

// Checks Validity
function shakeInput(inputElement) {
	inputElement.classList.add("shake");
	if (inputElement.getAttribute("id") == "nameDiv") {
		nameInput.style.color = "#ff1100";
		playNameSound();
	}
	setTimeout(() => {
		inputElement.classList.remove("shake");
	}, 700);
}
function validateName() {
	let isValid = nameInput.value.trim();
	let nameRegex =
		/^([a-zA-Z]{3,}\s[a-zA-Z]{1,}'?-?[a-zA-Z]{2,}\s?([a-zA-Z]{1,})?)$/;
	if (nameRegex.test(isValid)) {
		sendButton.style.visibility = "visible";
		sendButton.style.opacity = "1";
		sendButton.style.transform = "scale(1)";
		nameInput.style.color = "white";
		sendButton.classList.add("validated");
		return true;
	} else {
		sendButton.style.visibility = "hidden";
		sendButton.style.opacity = "0";
		sendButton.style.transform = "scale(0.3)";
		if (sendButton.classList.contains("validated")) {
			shakeInput(document.querySelector("#nameDiv"));
		}
		sendButton.classList.remove("validated");
		return false;
	}
}
nameInput.addEventListener("input", validateName);

nameInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter" || e.keyCode === 13 || e.which === 13) {
		e.preventDefault();
		var valid = validateName();
		if (valid === true) {
			profileSubmit();
		} else {
			shakeInput(document.querySelector("#nameDiv"));
		}
	}
});
// Name sound plays
let nameSound = null;
function playNameSound() {
	if (nameSound && !nameSound.paused) {
		return;
	}
	nameSound = new Audio("./src/name.mp3");
	nameSound.play();
}
// Photo sound plays
let photoSound = null;
function playPhotoSound() {
	if (photoSound && !photoSound.paused) {
		return;
	}
	photoSound = new Audio("./src/profile.mp3");
	photoSound.play();
}
// Submit sound plays
function playSubmitSound() {
	const sound = new Audio("./src/submit.mp3");
	sound.play();
}
// Message sent sound plays
function playMessageSentSound() {
	const sound = new Audio("./src/sound.mp3");
	sound.play();
}
// Message receive sound plays
function playMessageReceiveSound() {
	const sound = new Audio("./src/receive.mp3");
	sound.play();
}
// New user sound plays
function playNewUserSound() {
	const sound = new Audio("./src/newUser.mp3");
	sound.play();
}
// User left sound plays
function playUserLeftSound() {
	const sound = new Audio("./src/userLeft.mp3");
	sound.play();
}
// Ripple
document.querySelectorAll(".ripple").forEach((btn) => {
	btn.addEventListener("click", function (e) {
		let rect = this.getBoundingClientRect();
		let x = e.clientX - rect.left - window.scrollX;
		let y = e.clientY - rect.top - window.scrollY;
		let ripple = document.createElement("span");
		ripple.style.left = `${x}px`;
		ripple.style.top = `${y}px`;
		this.appendChild(ripple);
		setTimeout(() => {
			ripple.remove();
		}, 500);
	});
});
// Subbmission
function profileSubmit() {
	if (validateName() && photoInput.files.length > 0) {
		playSubmitSound();
		user = nameInput.value;
		socket.emit("new-user-connected", user);
		const photoStyle = window.getComputedStyle(photo);
		const backgroundImage = photoStyle.getPropertyValue("background-image");
		const urlStartIndex = backgroundImage.indexOf('"') + 1;
		const urlEndIndex = backgroundImage.lastIndexOf('"');
		profile = backgroundImage.substring(urlStartIndex, urlEndIndex);
		document.body.innerHTML = `<section id="loader">
		<svg viewBox="25 25 50 50">
			<circle r="20" cy="50" cx="50"></circle>
		</svg>
		Loading...
		</section>`;
		setTimeout(() => {
			document.body.innerHTML = `<section id="chatSection">
			<header>
				<h1>ChatBox</h1>
			</header>
			<div class="messageContainer"></div>
			<form>
				<textarea
					id="textarea"
					placeholder="Enter a message..."
					autofocus
					required></textarea>
				<button
					type="button"
					id="sendImage"
					class="uil uil-image-v"
					title="Send Photos">
					<input
						type="file"
						accept="image/*"
						style="display: none;"
						id="imageSend" />
				</button>
				<button
					type="button"
					id="sendHeart"
					class="uil uil-heart-sign"
					title="Send Heart"></button>
				<button
					type="button"
					id="send-button"
					class="uil uil-message"
					title="Send Message"></button>
			</form>
		</section>
		<div class="popup">
			<img src="" loading="lazy"/>
			<span> &times; </span>
		</div>`;
			setTimeout(() => {
				runChatSection();
			}, 2000);
		}, 1000);
	} else {
		if (!validateName()) {
			shakeInput(document.querySelector("#nameDiv"));
		}
		if (photoInput.files.length === 0) {
			shakeInput(photo);
			playPhotoSound();
		}
	}
}
// Photo Change
photo.addEventListener("click", () => {
	photoInput.click();
});
photoInput.addEventListener("change", (event) => {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			photo.style.backgroundImage = `url(${e.target.result})`;
			photo.classList.add("added");
		};
		reader.readAsDataURL(file);
	}
});
// ChatSection Starts
function runChatSection() {
	const messageContainer = document.querySelector(".messageContainer");
	const textarea = document.querySelector("#textarea");
	let sendButtonMessage = document.getElementById("send-button");
	const sendHeart = document.getElementById("sendHeart");
	const sendImage = document.getElementById("sendImage");
	const imageSend = document.getElementById("imageSend");
	// Message send to client and server
	function sendMessage(message) {
		if (message.trim() !== "") {
			message =
				message.charAt(0).toUpperCase() +
				message.slice(1).toLowerCase();
			let msg = {
				user: user,
				profile: profile,
				message: message.trim(),
			};
			// Append
			appendMessage(msg, "outgoing");
			textarea.value = "";
			textarea.focus();
			scrollToBottom();
			// Send to server
			socket.emit("message", msg);
			playMessageSentSound();
		}
	}
	// Send Button
	sendButtonMessage.addEventListener("click", () => {
		const mes = textarea.value;
		sendMessage(mes);
	});
	// Heart send to client and server
	function Heart() {
		let msg = {
			user: user,
			profile: profile,
			message: `<div class="pos heart">❤</div>`,
		};
		// Append
		appendMessage(msg, "outgoing");
		textarea.value = "";
		textarea.focus();
		scrollToBottom();
		// Send to server
		socket.emit("message", msg);
		playMessageSentSound();
	}
	sendHeart.addEventListener("click", Heart);
	// Photo send to client and server
	sendImage.addEventListener("click", () => {
		imageSend.click();
	});
	imageSend.addEventListener("change", (event) => {
		const sendImageFile = event.target.files[0];
		if (sendImageFile) {
			const read = new FileReader();
			read.onload = function () {
				console.log(this.value);
				let msg = {
					user: user,
					profile: profile,
					message: `<img class="pos sentImage" loading="lazy" src="${this.result}" />`,
				};
				// Append
				appendMessage(msg, "outgoing");
				textarea.value = "";
				textarea.focus();
				scrollToBottom();
				// Send to server
				socket.emit("message", msg);
				playMessageSentSound();
			};
			read.readAsDataURL(sendImageFile);
		}
	});
	// Message Stylining and appending
	function appendMessage(msg, type) {
		let mainDiv = document.createElement("div");
		let className = type;
		mainDiv.classList.add(className, "message");
		let markup;
		if (type == "incoming") {
			markup = `<img class="profilePic" src="${msg.profile}" loading="lazy"/><h4>${msg.user}</h4><span>${msg.message}</span>`;
		} else if (type == "outgoing") {
			markup = `<span>${msg.message}</span>`;
		}
		mainDiv.innerHTML = markup;
		messageContainer.appendChild(mainDiv);
		// Heart container finder
		const parentElements = document.querySelectorAll(".message");
		parentElements.forEach((parentElement) => {
			const childNodes = parentElement.childNodes;
			for (let i = 0; i < childNodes.length; i++) {
				const childNode = childNodes[i];
				if (childNode.nodeType === Node.ELEMENT_NODE) {
					const grandchildren = childNode.childNodes;
					for (let j = 0; j < grandchildren.length; j++) {
						const grandchild = grandchildren[j];
						if (grandchild.nodeType === Node.ELEMENT_NODE) {
							if (grandchild.classList.contains("pos")) {
								parentElement.style.backgroundColor =
									"transparent";
							}
						}
					}
				}
			}
		});
	}
	// Users name
	const append = (name) => {
		const messageElem = document.createElement("div");
		messageElem.innerText = `${name}`;
		messageElem.classList.add("conn");
		messageContainer.appendChild(messageElem);
	};
	// Users message recieving
	socket.on("message", (msg) => {
	if (user !== null) {
		appendMessage(msg, "incoming");
		playMessageReceiveSound();
		scrollToBottom();
	}
	});
	// Getting newly connected users
	socket.on("user-connected", (user) => {
		append(`${user} joined the chat`);
		playNewUserSound();
		scrollToBottom();
	});
	// Notify server when user is disconnecting
	window.addEventListener("beforeunload", (user) => {
		socket.emit("disconnecting", user);
	});
	// Getting disconnected users
	socket.on("user-disconnected", (userr) => {
		if (userr !== null) {
			append(`${userr} left the chat`);
			user = userr;
			playUserLeftSound();
			scrollToBottom();
		}
	});
	// Scrolling to latest message div
	function scrollToBottom() {
		messageContainer.scrollTop = messageContainer.scrollHeight;
	}
	// Textarea size
	autosize(textarea);
	textarea.addEventListener("keyup", (e) => {
		if (
			e.key === "Enter" &&
			!e.shiftKey == true &&
			!e.altKey == true &&
			!e.ctrlKey == true
		) {
			sendMessage(e.target.value);
			console.log(e);
		}
	});
	const popup = document.querySelector(".popup");
	const popupImage = document.querySelector(".popup img");
	messageContainer.addEventListener("click", (event) => {
		const target = event.target;
		if (target.matches(".message span img")) {
			const imageSrc = target.getAttribute("src");
			openPopup(imageSrc);
		}
	});
	function openPopup(imageSrc) {
		popupImage.src = imageSrc;
		popup.style.display = "flex";
		popupImage.style.animation = "fadeZoomIn 300ms ease-in";
	}
	function closePopup() {
		popupImage.style.animation = "fadeZoomOut 300ms ease-out";
		setTimeout(() => {
			popup.style.display = "none";
		}, 300);
	}
	document.querySelector(".popup span").addEventListener("click", () => {
		closePopup();
	});
}
