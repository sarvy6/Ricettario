import { useState, useEffect } from 'react';
import './App.css';

type Mode = "default" | "info" | "create" | "edit" | "delete" | "ingredients" | "notes" | "import" | "export" | "form";

interface Recipe {
  title: string;
  subTitle: string;
  ingredients: Ingredient[];
  notes: string[];
}

interface Ingredient {
  name: string;
  value: number;
}

interface Message {
  type: "success" | "error";
  message: string;
}

const defaultRecipe: Recipe = {
  title: '',
  subTitle: '',
  ingredients: [],
  notes: []
};

function App() {
  const [viewMode, setViewMode] = useState<Mode>("default");
  const [stackView, setStackView] = useState<Mode[]>([]);
  const [recipe, setRecipe] = useState<Recipe[]>([]);
  const [current, setCurrent] = useState<Recipe | null>(null);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null);
  const [currentNote, setCurrentNote] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isEdit, setIsEdit] = useState(-1);

  useEffect(() => {
    const stored = localStorage.getItem("recipes");
    setRecipe(stored ? JSON.parse(stored) : []);
  }, []);

  const handleCreate = () => {
    let msg: Message | undefined;
    if (!current) msg = { type: "error", message: "ricetta non selezionata" };
    else if (!current.title) msg = { type: "error", message: "titolo obbligatorio" };
    else if (!current.subTitle) msg = { type: "error", message: "sottotitolo obbligatorio" };
    else if (current.ingredients.length === 0) msg = { type: "error", message: "almeno un ingrediente è obbligatorio" };
    else {
      const data = [...recipe, current];
      setRecipe(data);
      localStorage.setItem("recipes", JSON.stringify(data));
      msg = { type: "success", message: "ricetta inserita" };
      changeView();
    }
    showMessage(msg?.type, msg?.message);
  };

  const handleEdit = () => {
    let msg: Message | undefined;
    if (!current) msg = { type: "error", message: "ricetta non selezionata" };
    else if (!current.title) msg = { type: "error", message: "titolo obbligatorio" };
    else if (!current.subTitle) msg = { type: "error", message: "sottotitolo obbligatorio" };
    else if (current.ingredients.length === 0) msg = { type: "error", message: "almeno un ingrediente è obbligatorio" };
    else {
      const data = recipe.map((r, i) => (i === isEdit ? current : r));
      setRecipe(data);
      localStorage.setItem("recipes", JSON.stringify(data));
      msg = { type: "success", message: "ricetta aggiornata" };
      changeView();
    }
    showMessage(msg?.type, msg?.message);
  };

  const handleDelete = () => {
    const data = recipe.filter((_, i) => i !== isEdit);
    setRecipe(data);
    localStorage.setItem("recipes", JSON.stringify(data));
    showMessage("success", "Ricetta eliminata");
    changeView();
  };

  const handleCreateIngredient = () => {
    let msg: Message | undefined;
    if (!currentIngredient) msg = { type: "error", message: "ingrediente non selezionato" };
    else if (currentIngredient.value <= 0) msg = { type: "error", message: "il valore dell'ingrediente deve essere > 0" };
    else if (current?.ingredients.find(i => i.name === currentIngredient.name)) msg = { type: "error", message: "ingrediente già esistente" };
    else {
      const data = [...(current?.ingredients ?? []), currentIngredient];
      handleChange("ingredients", data);
      msg = { type: "success", message: "ingrediente aggiunto" };
      changeView();
    }
    showMessage(msg?.type, msg?.message);
  };

  const handleCreateNote = () => {
    if (!currentNote) return showMessage("error", "nota non selezionata");
    const data = [...(current?.notes ?? []), currentNote];
    handleChange("notes", data);
    showMessage("success", "nota aggiunta");
    changeView();
  };

  const changeView = (view: Mode | null = null) => {
    if (view === null) {
      setStackView(prev => {
        const newStack = [...prev];
        newStack.pop();
        const prevView = newStack[newStack.length - 1] || "default";
        setViewMode(prevView);
        return newStack;
      });
    } else {
      setStackView(prev => [...prev, view]);
      setViewMode(view);
    }
  };

  const showMessage = (type?: "success" | "error", text?: string) => {
    if (!type || !text) return;
    setMessage({ type, message: text });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleChange = (name: keyof Recipe, value: any) => {
    setCurrent(prev => ({
      ...(prev ?? defaultRecipe),
      [name]: value
    }));
  };

  const handleIngredientChange = (name: keyof Ingredient, value: string | number) => {
    setCurrentIngredient(prev => ({
      ...(prev ?? { name: "", value: 0 }),
      [name]: value
    }));
  };

  return (
    <div className='cookbook-container'>
      <div className='title'>Recipe</div>

      {message && <div className={`message ${message.type}`}>{message.message}</div>}

      {viewMode === "default" && (
        <div className='default-container'>
          <div className='header'>
            <div className='button' onClick={() => { setCurrent(defaultRecipe); changeView("create"); }}>
              <img src="./create.png" alt="create" />
            </div>
            <div className='button'><img src="./import.png" alt="import" /></div>
            <div className='button'><img src="./export.png" alt="export" /></div>
          </div>
          <div className='content'>
            {recipe.map((i, index) => (
              <div className='card' key={index} onClick={() => { setCurrent(i); changeView("info"); }}>
                <div>{i.title}</div>
                <div>{i.subTitle}</div>
                <div className='button' onClick={(e) => { e.stopPropagation(); setCurrent({ ...i }); setIsEdit(index); changeView("edit"); }}>
                  <img src="./edit.png" alt="edit" />
                </div>
                <div className='button' onClick={(e) => { e.stopPropagation(); setIsEdit(index); changeView("delete"); }}>
                  <img src="./delete.png" alt="delete" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === "info" && current && (
        <div className='info-container'>
          <div className='main-container'>
            <div className='title'>{current.title}</div>
            <div className='subTitle'>{current.subTitle}</div>
            <div className='subTitle'>Ingredienti</div>
            <div className='ingredients-container'>
              {current.ingredients.map((i, idx) => (
                <div className='card' key={idx}>{`${i.name}: ${i.value}g`}</div>
              ))}
            </div>
            {current.notes.length > 0 && (
              <>
                <div className='subTitle'>Notes:</div>
                <div className='notes-container'>
                  {current.notes.map((i, idx) => (
                    <div className='card' key={idx}>{i}</div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className='button' onClick={() => changeView()}><img src="./return.png" alt="return" /></div>
        </div>
      )}

      {(viewMode === "create" || (viewMode === "edit" && current)) && (
        <div className='form-container'>
          <input type="text" onChange={(e) => handleChange("title", e.target.value)} value={current?.title} placeholder="title" />
          <input type="text" onChange={(e) => handleChange("subTitle", e.target.value)} value={current?.subTitle} placeholder="subTitle" />
          <div className='button' onClick={() => changeView("ingredients")}><img src="./cutlery.png" alt="ingredients" /></div>
          <div className='button' onClick={() => changeView("notes")}><img src="./notes.png" alt="notes" /></div>
          <div className='action-container'>
            <div className='button' onClick={() => viewMode === "create" ? handleCreate() : handleEdit()}><img src="./confirm.png" alt="confirm" /></div>
            <div className='button' onClick={() => { setIsEdit(-1); changeView(); }}><img src="./cancel.png" alt="cancel" /></div>
          </div>
        </div>
      )}

      {viewMode === "delete" && (
        <div className='delete-container'>
          <div className='title'>Sicuro di voler eliminare la ricetta?</div>
          <div className='action-container'>
            <div className='button' onClick={handleDelete}><img src="./confirm.png" alt="confirm" /></div>
            <div className='button' onClick={() => changeView()}><img src="./cancel.png" alt="cancel" /></div>
          </div>
        </div>
      )}

      {(viewMode === "ingredients" || viewMode === "notes") && current && (
        <div className='ingredients-container'>
          <div className='header'>
            <div className='button' onClick={() => changeView()}><img src="./return.png" alt="return" /></div>
          </div>
          <div className='main-container'>
            {viewMode === "ingredients" && current.ingredients.map((i, idx) => (
              <div className='card' key={idx}>
                <div>{`${i.name}: ${i.value}g`}</div>
                <div className='button'><img src="./delete.png" alt="delete" /></div>
              </div>
            ))}
            {viewMode === "notes" && current.notes.map((n, idx) => (
              <div className='card' key={idx}>
                <div>{n}</div>
                <div className='button'><img src="./delete.png" alt="delete" /></div>
              </div>
            ))}
            <div className='button' onClick={() => {
              setCurrentIngredient(viewMode === "ingredients" ? { name: "", value: 0 } : null);
              setCurrentNote(viewMode === "notes" ? "" : null);
              changeView("form");
            }}>
              <img src="./create.png" alt="create" />
            </div>
          </div>
        </div>
      )}

      {viewMode === "form" && (
        <div className='input-container'>
          <div className='form-container'>
            {currentIngredient && (
              <>
                <input type="text" value={currentIngredient.name} onChange={(e) => handleIngredientChange("name", e.target.value)} placeholder='ingrediente' />
                <input type="number" value={currentIngredient.value > 0 ? currentIngredient.value : ""} onChange={(e) => handleIngredientChange("value", Number(e.target.value))} placeholder='quantità in g' />
              </>
            )}
            {currentNote !== null && !currentIngredient && (
              <input type="text" value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} placeholder='note' />
            )}
          </div>
          <div className='action-container'>
            <div className='button' onClick={() => {
              if (currentNote !== null && !currentIngredient) handleCreateNote();
              else handleCreateIngredient();
            }}>
              <img src="./confirm.png" alt="confirm" />
            </div>
            <div className='button' onClick={() => changeView()}><img src="./cancel.png" alt="cancel" /></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
