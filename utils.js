let globalTranslationInfos = null;

let focusedCell = null;
const vscode = acquireVsCodeApi();

function displayTranslationInfo(translationInfos) {
  if (globalTranslationInfos === null) {
    globalTranslationInfos = translationInfos;
  }

  // Group translations by filename
  const groupedTranslations = {};

  translationInfos.forEach((item) => {
    const filename = item.filename;

    if (!groupedTranslations[filename]) {
      groupedTranslations[filename] = [];
    }

    groupedTranslations[filename].push(item);
  });

  // Get the table container where tables will be appended
  const tableContainer = $("#table-container");

  // Clear any existing tables within the container
  tableContainer.empty();

  // Create a table for each "filename" group
  for (const filename in groupedTranslations) {
    const table = $("<table class='table'></table>");
    const tableBody = $("<tbody></tbody>");

    // Add a header row
    const headerRow = $("<tr></tr>");
    headerRow.append(`
            <th scope="col" class="col-4 text-start">Key</th>
            <th scope="col" class="col-3 text-start">vi</th>
            <th scope="col" class="col-3 text-start">en</th>
            <th scope="col" class="col-2 text-start">filename</th>
        `);
    tableBody.append(headerRow);

    // Add rows for each translation in the group
    groupedTranslations[filename].forEach((item, index) => {
      const row = $("<tr></tr>");

      // Add the class "text-start" to the 'vi' and 'en' columns
      const cellClasses = "text-start";

      const keyCell = $("<td></td>").text(item.key);
      const deleteBtn = $(
        '<button type="button" class="btn btn-link">Delete</button>'
      );
      keyCell.append(deleteBtn);

      // Create editable 'vi' and 'en' cells with contenteditable
      const viCell = $("<td class='editable-cell'></td>").addClass(cellClasses);
      let viSpan;
      if (item.vi) {
        viSpan = $("<div contenteditable='true'></div>").text(item.vi);
      } else {
        viSpan = $("<div contenteditable='true' class='bg-danger'></div>").text(
          "--"
        );
      }

      const viButtons = $("<div class='action-buttons'></div>");
      const viConfirmButton = $(
        "<button class='btn confirm-button'>&#10004;</button>"
      );
      const viCancelButton = $(
        "<button class='btn cancel-button'>&#10006;</button>"
      );
      viCancelButton.on("click", function () {
        viSpan.text(item.vi);
      });
      viConfirmButton.on("click", function () {
        const json = item.jsonvi;
        const keys = item.key.split(".");
        const lastKey = keys.pop(); // Remove the last key from the array
        let currentObject = json;

        for (const key of keys) {
          currentObject = currentObject[key];
        }
        currentObject[lastKey] = viSpan.text();
        item.vi = viSpan.text();
        vscode.postMessage({
          command: "command",
          data: { json, path: item.pathvi },
        });
      });
      viButtons.append(viConfirmButton);
      viButtons.append(viCancelButton);
      viSpan.focus(function () {
        viButtons.show();
      });
      viSpan.blur(function () {
        setTimeout(function () {
          viButtons.hide();
        }, 150);
      });
      viCell.append(viSpan, viButtons);

      const enCell = $("<td class='editable-cell'></td>").addClass(cellClasses);
      let enSpan;
      if (item.en) {
        enSpan = $("<div contenteditable='true'></div>").text(item.en);
      } else {
        enSpan = $("<div contenteditable='true' class='bg-danger'></div>").text(
          "--"
        );
      }

      const enButtons = $("<div class='action-buttons'></div>");
      const enConfirmButton = $(
        "<button class='btn confirm-button'>&#10004;</button>"
      );
      const enCancelButton = $(
        "<button class='btn cancel-button'>&#10006;</button>"
      );
      enConfirmButton.on("click", function () {
        const json = item.jsonen;
        const keys = item.key.split(".");
        const lastKey = keys.pop(); // Remove the last key from the array
        let currentObject = json;

        for (const key of keys) {
          currentObject = currentObject[key];
        }
        currentObject[lastKey] = enSpan.text();
        vscode.postMessage({
          command: "command",
          data: { json, path: item.pathen },
        });
      });
      enCancelButton.on("click", function () {
        enSpan.text(item.en);
      });
      enButtons.append(enConfirmButton);
      enButtons.append(enCancelButton);
      enCell.append(enSpan, enButtons);
      enSpan.focus(function () {
        enButtons.show();
      });
      enSpan.blur(function () {
        setTimeout(function () {
          enButtons.hide();
        }, 150);
      });

      const filenameCell = $("<td></td>").text(item.filename);

      row.append(keyCell, viCell, enCell, filenameCell);
      tableBody.append(row);
    });

    table.append(tableBody);
    tableContainer.append(table);
  }
}

function clearTableContent() {
  // Find the <tbody> element inside the table
  const tableBody = document.querySelector("#table tbody");

  if (tableBody) {
    // Set the innerHTML of the <tbody> to an empty string to remove its content
    tableBody.innerHTML = "";
  }
}

function resetTable() {
  const filterInput = document.getElementById("filter-input");
  clearTableContent();
  displayTranslationInfo(
    globalTranslationInfos.filter((item) =>
      item.key.toLowerCase().includes(filterInput.value.toLowerCase())
    )
  );
}

function initApp() {
  const filterInput = document.getElementById("filter-input");
  const saveTranslationKeyBtn = $("#save-translation-key-btn");

  saveTranslationKeyBtn.on("click", function () {
    console.log($("#key-input").val());
    console.log($("#vi-input").val());
    console.log($("#en-input").val());
    console.log($("#file-name-input").val());
    $();
  });

  filterInput.addEventListener("input", function () {
    clearTableContent();
    displayTranslationInfo(
      globalTranslationInfos.filter((item) =>
        item.key.toLowerCase().includes(filterInput.value.toLowerCase())
      )
    );
  });
}
