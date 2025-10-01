const terminalText = document.getElementById("TerminalText");
const adminPromptInText = document.querySelector(".adminPromptInText");
const terminalInput = document.querySelector(".inputBox");
const adminPrompt = document.getElementById("adminPrompt");
const wrapper = document.getElementById("wrapper");

terminalInput.focus();
wrapper.addEventListener("click", () => terminalInput.focus());

//Loader
const loadArray = ["|", "/", "-", "\\"];
// To store previous commands
const prompts = [];
// Pointer to navigate through the prompts array
let pointer = 0;

// We are using an object her to flag the end of an event for the loading
// cursor to stop, mainly becuase JS takes face values instead of refrences
// great lanaguage :)
const flag = {
  done: false,
};

// Perhaps change innerHTML to textContent for security, especially XSS attacks.

terminalInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    pointer = prompts.length;
    const userInput = terminalInput.value.trim();
    const userInputArray = userInput.split(" ");
    console.log(typeof userInput);
    prompts.push(terminalInput.value);
    for (let i = 1; i < prompts.length; i++) {
      console.log(prompts[i]);
    }

    terminalText.innerHTML +=
      "<br/>" + adminPrompt.innerHTML + userInput /*+ "<br/>"*/;
    terminalInput.value = "";

    if (userInput.startsWith("ping")) {
      const parts = userInput.split(" ");

      if (parts[1] === "" || parts.length < 2) {
        terminalText.innerHTML += "<br/>" + "Usage: ping [Domain/IP]";
        return;
      }

      // The loader is currently broken primarily becuase it's not looping correctly.
      // probably due to synchronous/asynchronous issues.
      // best think is to utilise this issue and make the loading real
      // by setting an interval and clearing it either when the pings are flag.done or after a certain time (timeout).

      let message =
        "<br/> Pinging " +
        parts[1] +
        " with ~2048 bytes of data (HTTP fetch) <br/>";
      terminalText.innerHTML += "<br/>" + message;
      loader(" ", flag);

      let times = 0;
      let successful = 0;
      // Will run immeaditly initating 4 instances of ping that is asynch
      for (let i = 0; i < 4; i++) {
        let response;
        let date = new Date();
        ping("https://" + parts[1] + "/")
          .then((res) => {
            times++;
            if (res === false) response = "Request timed out.";
            else {
              successful++;
              if (successful == 1) {
                response =
                  "Reply from " + parts[1] + " " + (new Date() - date) + " ms";
                prevDate = new Date() - date;
              } else {
                response =
                  "Reply from " +
                  parts[1] +
                  " " +
                  (new Date() - prevDate - date) +
                  " ms";
              }
            }
            terminalText.innerHTML += "<br/>" + response;
            console.log(response);
            wrapper.scrollTop = wrapper.scrollHeight;

            if (times >= 4) {
              flag.done = true;

              let lost = times - successful;
              terminalText.innerHTML +=
                "<br/><br/> Ping Statistics for " + parts[1] + ":";
              terminalText.innerHTML +=
                "<br/>\tPackets: Sent = 4, Recieved = " +
                successful +
                ", Lost = " +
                lost +
                " (" +
                lost * 25 +
                "% loss)";
              wrapper.scrollTop = wrapper.scrollHeight;
            }
            if (times - successful >= 4) {
              terminalText.innerHTML +=
                "<br/><br/> Note: " +
                parts[1] +
                " either doesn't allow HTTPS requests (CORS) or is offline. <br/>" +
                "Try an IP like 8.8.8.8, a domain like github.com, or even northvpn.com.";
            }
          })
          .catch((e) => {
            console.log(e);
            terminalText.innerHTML += "<br/>" + e;
            flag.done = true;
          });
      }
    } else if (userInput.startsWith("whoami")) {
      getIP().then(
        // ip will be the returned value from getip into a lambda function
        (userSpecs) => {
          terminalText.innerHTML += `<br/><br/>
          Note: This data is completly private and is only available locally, and this data depeneds on your own browser/settings and could be spoofed by it. <br/>
          <br/> > Your Agent:: ${userSpecs.agent} 
          <br/> > Your CGNAT IP Adress/Public IPv4 Adress:: ${
            userSpecs.ipAdress
          }
          <br/> > Your Machines's Number of Threads:: ${
            userSpecs.hardwareConcurrency
          } Threads
          <br/> > Your Screen's Resolution:: ${userSpecs.screenRes}
          <br/> > Your Region/Timezone:: ${userSpecs.timezone}
          <br/> > Your Cookie Settings:: ${
            userSpecs.cookiesEnabled ? "Enabled" : "Disabled"
          }
          <br/> > Your Language/s:: ${userSpecs.languages}
          `;
          wrapper.scrollTop = wrapper.scrollHeight;
        }
      );
    } else if (userInput === "clear" || userInput === "clc") {
      terminalText.innerHTML = "";
      inputBox.value = "";
    } else if (userInput === "help") {
      terminalText.innerHTML +=
        "<br/>Available commands: <br/>ping [Domain/IP] - Pings a domain or IP address using HTTP fetch requests.<br/>clear/clc - Clears the terminal screen.<br/>help - Displays this help message.<br/>";
    } else if (userInput === "") {
      // Do nothing on empty input
    } else if (userInput === "exit") {
      terminalText.innerHTML += "<br/>Logging out...";
      (async () => {
        await sleep(1500);
        terminalText.innerHTML += "<br/>See You Next Time";

        await sleep(2500);
        window.close();
      })();
    } else if (userInput === "version" || userInput === "ver") {
      terminalText.innerHTML +=
        "<br/>Terminal Emulator Version 1.0.0<br/>Developed by Yasir Aloufi <br/>";
    } else if (userInput === "date" || userInput === "time") {
      const currentDate = new Date();
      terminalText.innerHTML +=
        "<br/>" + currentDate.toString().replace("0300", "3") + "<br/>";
    } else if (userInput === "whoami") {
      terminalText.innerHTML += "<br/>Under Construction, Please Wait.<br/>";
    } else if (userInput === "sudo") {
      terminalText.innerHTML +=
        "<br/>You are not in the sudoers file. This incident will be reported.<br/>";
    } else if (userInput.startsWith("echo")) {
      // easier to use slice here instead of the array because of the case of multiple words
      const echoMessage = userInput.slice(5);
      terminalText.innerHTML += "<br/>" + echoMessage + "<br/>";
    } else if (userInput.startsWith("loader")) {
      flag.done = false;
      loader("Loading... ", flag);
      setTimeout(() => {
        flag.done = true;
        terminalText.innerHTML += "<br/>done!<br/>";
        wrapper.scrollTop = wrapper.scrollHeight;
      }, 5000);
    } else {
      terminalText.innerHTML += "<br/>Command not found: " + userInput;
      terminalInput.value = "";
    }
    // Scroll to the bottom of the terminal
    wrapper.scrollTop = wrapper.scrollHeight;

    // could have used a stack to implement this oh well..
  } else if (event.key === "ArrowUp") {
    moveCursorToEnd();
    if (prompts.length === 0) return;
    if (pointer < 0) {
      return;
    }

    terminalInput.value = prompts[pointer];
    if (pointer != 0) {
      --pointer;
    }

    console.log(prompts.length - 1);
    console.log(pointer);
    // issue her skipping some inputs
  } else if (event.key === "ArrowDown") {
    console.log(prompts.length);
    if (prompts.length === 0) return;
    if (pointer >= prompts.length - 1) {
      terminalInput.value = "";
      return;
    }
    terminalInput.value = prompts[pointer];
    ++pointer;

    console.log(prompts.length - 1);
    console.log(pointer);
  }
});

const ping = (url, timeout = 6000) => {
  return new Promise((resolve, reject) => {
    const urlRule = new RegExp(
      "(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]"
    );
    if (!urlRule.test(url)) throw reject("invalid url");
    try {
      fetch(url, { mode: "no-cors" })
        .then(() => resolve(true))
        .catch(() => resolve(false));
      setTimeout(() => {
        resolve(false);
      }, timeout);
    } catch (e) {
      reject(e);
    }
  });
};

// Doesn't work currently
function moveCursorToEnd() {
  const length = terminalInput.value.length;
  // Focus on the input
  terminalInput.focus();
  // Set the cursor to the end
  terminalInput.setSelectionRange(length, length);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loader(message, flag) {
  let loaderItem = 0;
  terminalText.innerHTML += "<br/>" + loadArray[loaderItem] + "  " + message;
  let timerId = setInterval(() => {
    if (flag.done) {
      clearInterval(timerId);
      terminalText.innerHTML = terminalText.innerHTML.replace(
        loadArray[loaderItem],
        " "
      );

      // Set to false for future usage
      flag.done = false;
      return;
    }
    loaderItem = (loaderItem + 1) % loadArray.length;
    // Replace only the last loader character
    terminalText.innerHTML = terminalText.innerHTML.replace(
      loadArray[(loaderItem + loadArray.length - 1) % loadArray.length],
      loadArray[loaderItem]
    );
  }, 100);
}

async function getIP() {
  try {
    const ua = navigator;
    const userSpecs = {
      agent: navigator.userAgent,
      languages: navigator.languages,
      screenRes: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency,
      // Depracted: too clunky as it requests the user for the data
      // clipboard: await navigator.clipboard.removeEventListener() || null,
      cookiesEnabled: navigator.cookieEnabled,
    };
    const res = await fetch("https://api.ipify.org?format=json");

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.statusText}`);
    }

    const data = await res.json();
    userSpecs.ipAdress = data.ip;
    console.log(typeof data.ip);
    console.log(userSpecs);
    return userSpecs;
  } catch (err) {
    console.error(`Error fetching ip: ${err}`);
  }
}
