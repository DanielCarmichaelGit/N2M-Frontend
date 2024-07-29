import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import fetchWrapper from "../utils/fetchWrapper";

function Dashboard() {
  const [view, setView] = useState("refactor");
  const [refactorInput, setRefactorInput] = useState("");
  const [askInput, setAskInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [contexts, setContexts] = useState([]);
  const [refactorResponse, setRefactorResponse] = useState(null);
  const [disabledButton, setDisableButton] = useState(false);

  useEffect(() => {
    fetchWrapper("/context", localStorage.getItem("N2M"), "GET", {}).then(
      (res) => {
        if (res.count) {
          setContexts(res.contextDocs);
        }
      }
    );
  }, []);

  const toggleView = (newView) => {
    if (view === "add-context") {
      setContextInput("");
      setRefactorResponse(null);
    }
    if (view !== "refactor") {
      setRefactorResponse(null);
    }
    setView(newView);
  };

  const handleRefactorInputChange = (e) => {
    setRefactorInput(e.target.value);
  };

  const handleAskInputChange = (e) => {
    setAskInput(e.target.value);
  };

  const handleContextInputChange = (e) => {
    setContextInput(e.target.value);
  };

  const selectContext = (context) => {
    setView("add-context");
    setContextInput(context.text);
  };

  const formatResponse = (response) => {
    const lines = response.split('\n');
    let formattedResponse = [];
    let codeBlock = false;
    let listBlock = false;
    let listItems = [];
  
    lines.forEach((line, index) => {
      // Check for code blocks
      if (line.trim().startsWith('```')) {
        if (codeBlock) {
          formattedResponse.push(<pre key={`code-${index}`} className="code-block">{listItems.join('\n')}</pre>);
          listItems = [];
        }
        codeBlock = !codeBlock;
        return;
      }
  
      if (codeBlock) {
        listItems.push(line);
        return;
      }
  
      // Check for numbered lists
      if (/^\d+\.\s/.test(line)) {
        if (!listBlock) {
          listBlock = true;
          listItems = [];
        }
        listItems.push(line.replace(/^\d+\.\s/, ''));
      } else {
        if (listBlock) {
          formattedResponse.push(
            <ol key={`list-${index}`}>
              {listItems.map((item, i) => <li key={`list-item-${i}`}>{item}</li>)}
            </ol>
          );
          listBlock = false;
          listItems = [];
        }
        formattedResponse.push(<p key={`text-${index}`}>{line}</p>);
      }
    });
  
    // Handle any remaining list items
    if (listBlock) {
      formattedResponse.push(
        <ol key={`list-final`}>
          {listItems.map((item, i) => <li key={`list-item-final-${i}`}>{item}</li>)}
        </ol>
      );
    }
  
    // Handle any remaining code block items
    if (codeBlock) {
      formattedResponse.push(<pre key={`code-final`} className="code-block">{listItems.join('\n')}</pre>);
    }
  
    return formattedResponse;
  };

  const handleRefactorSubmit = () => {
    if (refactorInput.trim() === "") return;
    setDisableButton(true);
    setRefactorResponse("");
    fetchWrapper("/refactor", localStorage.getItem("N2M-token"), "POST", {
      code: refactorInput,
    }).then((res) => {
      if (res.response) {
        setRefactorResponse(formatResponse(res.response));
      } else {
        setConversation((prev) => [
          ...prev,
          { type: "answer", text: "THERE WAS AN ERROR" },
        ]);
      }
      setDisableButton(false);
    });
  };

  const handleAskSubmit = () => {
    if (askInput.trim() === "") return;
    setAskInput("");
    setConversation([...conversation, { type: "question", text: askInput }]);
    fetchWrapper("/ask", localStorage.getItem("N2M-token"), "POST", {
      question: askInput,
    }).then((res) => {
      console.log(res);

      if (res.response) {
        setConversation((prev) => [
          ...prev,
          { type: "answer", content: formatResponse(res.response) },
        ]);
        setAskInput("");
      } else {
        setConversation((prev) => [
          ...prev,
          { type: "answer", content: <p>THERE WAS AN ERROR</p> },
        ]);
      }
    });
  };

  const handleContextSubmit = () => {
    if (contextInput.trim() === "") return;

    fetchWrapper("/context", localStorage.getItem("N2M-token"), "POST", {
      context: contextInput,
    }).then((res) => {
      console.log(res);
    });
    setContextInput("");
  };

  const buttonStyle = (buttonView) => ({
    backgroundColor: view === buttonView ? "#d1e8ff" : "#f1f1f1",
    fontWeight: view === buttonView ? "bold" : "normal",
  });

  return (
    <div className="Dashboard">
      <Navbar />
      <div className="Content">
        <div className="Paradigms">
          <button onClick={() => toggleView("add-context")}>Add Context</button>
          {/* <div className="SearchContainer">
            <p>Search paradigm context</p>
            <input className="SearchInput" type="text" />
          </div> */}
          <div className="ParadigmResults">
            <p>Found {contexts.length} context docs</p>
            {contexts.map((context, index) => {
              return (
                // eslint-disable-next-line react/jsx-key
                <div
                  key={`${index}_context`}
                  onClick={() => selectContext(context)}
                  className="ContextDoc"
                >
                  <p>{context.text}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="DashboardView">
          <div className="ViewToggle">
            <button
              onClick={() => toggleView("refactor")}
              style={buttonStyle("refactor")}
            >
              Refactor Code
            </button>
            <button
              onClick={() => toggleView("ask")}
              style={buttonStyle("ask")}
            >
              Ask
            </button>
          </div>
          {view === "add-context" && (
            <div className="RefactorView">
              <textarea
                value={contextInput}
                onChange={handleContextInputChange}
                placeholder="Paste your context doc here"
                className="Refactor"
              />
              <button onClick={handleContextSubmit}>Submit Context</button>
            </div>
          )}
          {view === "refactor" && (
        <div className="RefactorView">
          <div className="RefactorContent">
            <div className="RefactorInput">
              <textarea
                value={refactorInput}
                onChange={handleRefactorInputChange}
                placeholder="Paste your code here for refactoring..."
                className="Refactor"
              />
            </div>
            {refactorResponse && (
              <div className="RefactorOutput">
                {refactorResponse}
              </div>
            )}
          </div>
          <button disabled={disabledButton} onClick={handleRefactorSubmit}>
            Submit for Refactoring
          </button>
        </div>
      )}
      {view === "ask" && (
        <div className="AskView">
          <div className="Conversation">
            {conversation.map((item, index) => (
              <div key={index} className={item.type}>
                {item.type === "question" ? item.text : item.content}
              </div>
            ))}
          </div>
          <div className="InputArea">
            <input
              type="text"
              value={askInput}
              onChange={handleAskInputChange}
              placeholder="Ask a question..."
            />
            <button onClick={handleAskSubmit}>Send</button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
