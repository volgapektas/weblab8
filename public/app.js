const statusCodeElement = document.getElementById("status-code");
const responseBodyElement = document.getElementById("response-body");
const buttons = document.querySelectorAll(".button-grid button");

async function callApiRoute(path, method) {
  statusCodeElement.textContent = "Loading...";
  responseBodyElement.textContent = "Fetching response from server...";

  try {
    const response = await fetch(path, { method });
    statusCodeElement.textContent = `${response.status} ${response.statusText}`;

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      responseBodyElement.textContent = JSON.stringify(data, null, 2);
    } else {
      const text = await response.text();
      responseBodyElement.textContent = text;
    }
  } catch (error) {
    statusCodeElement.textContent = "Network / Fetch Error";
    responseBodyElement.textContent = `Request failed without crashing the page: ${error.message}`;
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const path = button.getAttribute("data-path");
    const method = button.getAttribute("data-method") || "GET";
    callApiRoute(path, method);
  });
});
