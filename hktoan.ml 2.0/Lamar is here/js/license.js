const data = {
  text: "MIT License \n Copyright (c) 2021 Hackatoa.",
};

document.getElementById("text").innerText += data.text;

function back() {
  history.back();
}
