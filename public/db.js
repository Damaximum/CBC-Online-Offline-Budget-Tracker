let db;
const request = window.indexedDB.open("budgetTracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("offlineBudget", {
      autoIncrement: true,
    });
  }
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["offlineBudget"], "readwrite");
  const store = transaction.objectStore("offlineBudget");
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["offlineBudget"], "readwrite");
  const store = transaction.objectStore("offlineBudget");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    console.log(getAll.result);
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["offlineBudget"], "readwrite");
          const store = transaction.objectStore("offlineBudget");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
