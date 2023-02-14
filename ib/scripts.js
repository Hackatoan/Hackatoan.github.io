/* Place your JavaScript in this file */

function draw() {
  var canvas = document.getElementById("flowchart");
  if (canvas.getContext) {
    var context = canvas.getContext("2d");
    context.fillRect(20, 20, 100, 100);
  }
}

function openfi() {
  //open .txt and convert it into visible diagram
  console.log("open");
  draw();
}
function savefi() {
  //save diagram into a text file that can be opened later
  console.log("save");
}
document.getElementById("export").addEventListener("click", function () {
  html2canvas(document.getElementById("flowchart")).then(function (canvas) {
    var link = document.createElement("a");
    link.download = "screenshot.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});
