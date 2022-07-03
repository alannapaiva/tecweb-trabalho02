document.querySelectorAll('input[type=radio]+label').forEach(item => {
	let clickSound = document.querySelector('[click-option]')

	item.addEventListener('mousedown', () => clickSound.play())
})
