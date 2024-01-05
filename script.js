const socket = io("https://voting-app-tpnw.onrender.com");

const progressBoxes = document.querySelectorAll(".progress-box");
const percentTags = document.querySelectorAll(".percent-tag");
const totalVotesElem = document.getElementById("totalVotes");

for (let i = 0; i < progressBoxes.length; i++) {
  const elem = progressBoxes[i];
  elem.addEventListener("click", () => {
    addVote(elem, elem.id);
  });
}

let vote = false;

const addVote = (elem, id) => {
  if (vote) {
    return;
  }
  let voteTo = id;
  socket.emit("send-vote", voteTo);
  vote = true;
  elem.classList.add("active");
};

socket.on("receive-vote", (data) => {
  updatePolls(data);
});

socket.on("update", (data) => {
  updatePolls(data);
});

const updatePolls = (data) => {
  let votingObject = data.votingPolls;
  let totalVotes = data.totalVotes;
  totalVotesElem.innerHTML = totalVotes;
  for (let i = 0; i < percentTags.length; i++) {
    let vote = votingObject[progressBoxes[i].id];
    let setWidth = Math.round((vote / totalVotes) * 100);
    const elem = document
      .querySelector(`#${progressBoxes[i].id}`)
      .querySelector(".percent-tag");
    elem.setAttribute("data", `${!setWidth ? 0 : setWidth}%`);
    elem.style.width = `${!setWidth ? 0 : setWidth}%`;
  }
};

// Voting cookies

document.addEventListener("DOMContentLoaded", function () {
  const progressBoxes = document.querySelectorAll(".progress-box");

  let alreadyVoted = false;

  progressBoxes.forEach(function (progressBox) {
    const cookieName =
      "voted_" + progressBox.closest(".poll-container").dataset.pollId;
    if (getCookie(cookieName) === "true") {
      alreadyVoted = true;
      disableProgressBox(progressBox);
    }
  });

  if (!alreadyVoted) {
    progressBoxes.forEach(function (progressBox) {
      progressBox.addEventListener("click", function () {
        castVote(this);
      });
    });
  }

  function castVote(clickedBox) {
    const pollContainer = clickedBox.closest(".poll-container");
    const cookieName = "voted_" + pollContainer.dataset.pollId;

    if (getCookie(cookieName) === "true") {
      alert("You already voted for this poll!");
      showAlreadyVotedMessage(pollContainer);
      return;
    }

    setCookie(cookieName, "true", 30); // Standard cookie for 30 days

    // Uncomment the line below for testing a 1-minute cookie expiration
    // setCookie(cookieName, "true", 1 / 1440); // 1 minute (1/1440 of a day)

    disableProgressBox(clickedBox);
  }

  function disableProgressBox(box) {
    const pollContainer = box.closest(".poll-container");
    pollContainer.classList.add("disabled");
  }

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  function getCookie(name) {
    const cookieArray = document.cookie.split(";");
    for (let i = 0; i < cookieArray.length; i++) {
      const cookiePair = cookieArray[i].split("=");
      if (name === cookiePair[0].trim()) {
        return cookiePair[1];
      }
    }
    return null;
  }
});
