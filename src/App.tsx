import { useState, useEffect } from 'react'
import './App.css';
type mode = "default" | "info" | "create" | "edit" | "delete" | "ingredients" | "notes" |"import" | "export" | "form";
interface Recipe{
  title: string;
  subTitle: string;
  ingredients: Ingredient[];
  notes: string[];
}
interface Ingredient{
  name: string;
  value: number;
}
interface Message{
  type: "success" | "error";
  message: string;
}
function App() {

  const [viewMode, setViewMode] = useState<mode>("default");
  const [stackView, setStackView] = useState<mode[]>([]);
  const [recipe, setRecipe] = useState<Recipe[]>([]);
  const [current, setCurrent] = useState<Recipe | null>(null);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null);
  const [currentNote,setCurrentNote] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isEdit, setIsEdit] = useState(-1);
  useEffect(() => {
    const stored = localStorage.getItem("recipes");
    setRecipe(stored ? JSON.parse(stored) : []);
  }, []);
  const handleCreate = async () => {
  let message: Message | undefined = undefined;
  if(!current) message = {type: "error", message: "ricetta non selezionata"};
  if(!message && !current?.title) message = {type: "error", message: "titolo obbligatorio"};
  if(!message && !current?.subTitle) message = {type: "error", message: "sottotitolo obbligatorio"};
  if(!message && current?.ingredients.length == 0) message = {type: "error", message: "almeno un ingrediente è obbligatorio"};
  if(!message){
    const data = recipe;
    recipe.push(current?? defaultRecipe);
    setRecipe(data);
    message = {type: "success", message: "ricetta inserita"};
    changeView();
    localStorage.setItem("recipes",JSON.stringify(data));
  }
  showMessage(message?.type, message?.message);
}

const handleEdit = async () => {
  let message: Message | undefined = undefined;
  if(!current) message = {type: "error", message: "ricetta non selezionata"};
  if(!message && !current?.title) message = {type: "error", message: "titolo obbligatorio"};
  if(!message && !current?.subTitle) message = {type: "error", message: "sottotitolo obbligatorio"};
  if(!message && current?.ingredients.length == 0) message = {type: "error", message: "almeno un ingrediente è obbligatorio"};
  if(!message){
    const data: Recipe[] = [];
    for(let i = 0; i < recipe.length; i++) {
      if(i == isEdit) data.push(current?? defaultRecipe);
      else data.push(recipe[i]);
    }
    setRecipe(data);
    message = {type: "success", message:"ricetta aggiornata"};
    changeView();
    localStorage.setItem("recipes",JSON.stringify(data));
  }
    showMessage(message?.type, message?.message);
}
const handleDelete = async () => {
  const data: Recipe[] = [];
  for(let i = 0; i < recipe.length; i++) if(i !== isEdit) data.push(recipe[i]);
  setRecipe(data);
  changeView();
  localStorage.setItem("recipes",JSON.stringify(data));
  showMessage("success","Ricetta eliminata");
}
const handleCreateIngredient = () => {
  let message: Message | undefined = undefined;
  if(!currentIngredient) message = {type: "error", message: "ingrediente non selezionato"};
  if(!message && currentIngredient?.value && currentIngredient.value <= 0)  message = {type: "error", message:"il valore dell'ingrediente deve essere > 0"};
  if(!message && current?.ingredients.find(i => i.name === currentIngredient?.name)) message = {type: "error", message: "ingrediente già esistente"};
  if(!message){
    const data = [...current?.ingredients?? [], currentIngredient];
    handleChange("ingredients",data);
    message = {type: "success",message:"ingrediente aggiunto"};
    changeView();
  }
  showMessage(message?.type, message?.message);
}
const handleCreateNote = () => {
  let message: Message | undefined = undefined;
  if(!currentNote) message = {type: "error", message: "nota non selezionata"};
  if(!message){
    const data = [...current?.notes?? [], currentNote];
    handleChange("notes",data);
    message = {type: "success", message: "nota aggiunta"};
    changeView();
  }
  showMessage(message?.type,message?.message);
}
const changeView = (view: mode | null = null) => {
  if (view === null) {
    setStackView(prevStack => {
      if (prevStack.length <= 1) {
        setViewMode("default");
        return [];
      }

      const newStack = [...prevStack];
      newStack.pop(); // rimuovi l'attuale
      const previous = newStack[newStack.length - 1];
      setViewMode(previous);
      return newStack;
    });
  } else {
    setStackView(prevStack => [...prevStack, view]);
    setViewMode(view);
  }
};
const showMessage = (type: "success" | "error", text: string) => {
  setMessage({ type, message: text });
  setTimeout(() => {
    setMessage(null);
  }, 2000);
}

const handleChange = (name: string, value: string | number | Ingredient[] | string[]) => {
  setCurrent(prev => ({
  ... (prev ?? defaultRecipe),
  [name]: value
}));
};
const handleIngredientChange = (name: string, value: string | number) => {
  setCurrentIngredient(prev => ({
    ...(prev ?? {name: "", value: 0}),
    [name]: value
  }));
};
const defaultRecipe: Recipe = {
  title: '',
  subTitle: '',
  ingredients: [],
  notes: []
};

  return (
    <>
      <div className='cookbook-container'>
      <div className='title'>Recipe</div>
      {message && (
        <div className={`message ${message.type}`}>{message.message}</div>
      )}
      {viewMode === "default" && (
        <div className='default-container'>
           <div className='header'>
            <div className='button' onClick={() => { setCurrent(defaultRecipe); changeView("create");}}><img src="./create.png"/></div> 
            <div className='button'><img src="./import.png"/></div> 
            <div className='button'><img src="./export.png"/></div> 
           </div>
           <div className='content'>
            {recipe.map((i, index) => (
              <div className='card' onClick={() => {setCurrent(i); changeView("info");}}>
                <div>{i.title}</div>
                <div>{i.subTitle}</div>
                <div className='button' onClick={(e) =>{e.stopPropagation(); setCurrent({...i}); setIsEdit(index); changeView("edit");}}><img src="./edit.png"/></div>
                <div className='button' onClick={(e) =>{e.stopPropagation(); setIsEdit(index); changeView("delete");}}><img src="./delete.png"/></div>
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
              {current.ingredients.map(i => (
                <div className='card'>`{i.name}: {i.value}g`</div>
              ))}
            </div>
            {current.notes && (
              <>
                <div className='subTitle'>notes:</div>
                <div className='notes-container'>
                {current.notes.map( i => (
                  <div className='card'>{i}</div>
                ))}
            </div>
              </>
            )}
          </div>
          <div className='button' onClick={() => changeView()}><img src="./return.png"/></div>
        </div>
      )}
      {(viewMode === "create" || viewMode === "edit" && current) && (
        <div className='form-container'>
          <input 
          type="text"
          onChange={(e) => handleChange("title", e.target.value.toLowerCase())}
          value={current?.title}
          placeholder='title'
          />
          <input 
            type='text'
            onChange={(e) => handleChange("subTitle", e.target.value.toLocaleLowerCase())}
            value={current?.subTitle}
            placeholder='subTitle'
          />
          <div className='button' onClick={() => changeView("ingredients")}><img src="./cutlery.png"/></div>
          <div className='button' onClick={() => changeView("notes")}><img src="./notes.png"/></div>
          <div className='action-container'>
            <div className='button' onClick={() => {if(viewMode === "create") handleCreate();else handleEdit()}}><img src="./confirm.png"/></div>
            <div className='button' onClick={() => {setIsEdit(-1); changeView()}}><img src="./cancel.png"/></div>
          </div>
        </div>
      )}
      {viewMode === "delete" && (
        <div className='delete-container'>
          <div className='title'>sicuro di voler eliminare la ricetta?</div>
          <div className='action-container'>
            <div className='button' onClick={handleDelete}><img src="./confirm.png"/></div>
            <div className='button' onClick={() => changeView()}><img src="./cancel.png"/></div>
          </div>
        </div>
      )}
      {(viewMode === "ingredients" || viewMode === "notes") && current && (
        <div className='ingredients-container'>
          <div className='header'><div className='button' onClick={() => changeView()}><img src="./return.png"/></div></div>
          <div className='main-container'>
            {viewMode === "ingredients" &&  current.ingredients.map( i => (
              <div className='card'>
                <div>`{i.name}: {i.value}g`</div>
                <div className='button'><img src="./delete.png"/></div>
              </div>
            ))}
            {viewMode === "notes" && current.notes.map(i => (
               <div className='card'>
                <div>`{i}`</div>
                <div className='button'><img src="./delete.png"/></div>
              </div>
            ))}
            <div className='button' onClick={() => {if(viewMode === "ingredients") setCurrentIngredient({name: "", value:0});else setCurrentNote(""); changeView("form")}}><img src="./create.png"/></div>
          </div>
        </div>
      )}
      {viewMode === "form" && (currentIngredient || currentNote != null) && (
        <div className='input-container'>
          <div className='form-container'>
          {currentIngredient && (
            <>
              <input 
              type="text"
              value={currentIngredient.name}
              onChange={(e) => handleIngredientChange("name",e.target.value)}
              placeholder='ingrediente'
             />
             <input 
              type="number"
              value={currentIngredient.value > 0 ? currentIngredient.value : ""}
              onChange={(e) => handleIngredientChange("value",Number(e.target.value))}
              placeholder='quantità in g'
             />
            </>
          )}
          {currentNote != null && !currentIngredient && (
            <input
             type="text" 
             value={currentNote}
             onChange={(e) => setCurrentNote(e.target.value)}
             placeholder='note'
            />
          )}
          </div>
          <div className='action-container'>
            <div className='button' onClick={() => {if(currentNote != null && !currentIngredient) handleCreateNote(); else handleCreateIngredient();}}><img src="./confirm.png"/></div>
            <div className='button' onClick={() => { setCurrentIngredient(null); setCurrentNote(""); changeView()}}><img src="./cancel.png"/></div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default App
