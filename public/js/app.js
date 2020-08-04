const backdrop = document.querySelector(".backdrop");
const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");

backdrop.addEventListener("click", () => {
	console.log("aman");
	sidebar.style.transform = "translateX(-50rem)";
	backdrop.style.display = "none";
});

hamburger.addEventListener("click", () => {
	sidebar.style.transform = "translateX(0rem)";
	backdrop.style.display = "block";
});
