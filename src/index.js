import MaterialButton from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import Typography from '@material-ui/core/Typography'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


window.allItemTypesContainingStructure=function(structure)
{
	const out=[]
	console.assert(arguments.length===1,'Wrong number of arguments')
	// window.assert.isPureObject(structure)
	for(const [itemType,itemSchema] of Object.entries(window.getItemSchemas()))
	{
		if(window.containsStructure(itemSchema,structure))
		{
			out.push(itemType)
		}
	}
	return out
}
window.allItemIdsOfType=function(type)
{
	const out=[]
	console.assert(arguments.length===1,'Wrong number of arguments')
	// window.assert.isString(type)
	for(const [_id,_type] of Object.entries(window.config.items))
	{
		if(type===_type)
		{
			out.push(_id)
		}
	}
	return out
}
window.allItemIdsContainingStructure=function(structure)
{
	let out=[]
	console.assert(arguments.length===1,'Wrong number of arguments')
	// window.assert.isPureObject(structure)
	const types=window.allItemTypesContainingStructure(structure)
	for(const type of types)
	{
		const itemIds=window.allItemIdsOfType(type)
		out=[...out,...itemIds]
	}
	return out
}
window.allItemIdsWithTransform=function()
{
	//Return all item ids with full position, rotation, and
	return window.allItemIdsContainingStructure({transform:{}})
}


function Multiplexer({schema})
{
	const [selectedOption, setSelectedOption]=useState(null)
	if(!schema)
		return <div></div>
	const options=Object.keys(schema).map(key=>({value: key, label: key}))
	return <div>
		<Select style={{width: '100%'}} value={{label: selectedOption}}
				onChange={x=>setSelectedOption(x.value)}
				options={options}
		/>
		<div style={{width: '100%'}}>
			<table style={{width: '100%'}}>
				<tbody>
				<tr style={{width: '100%'}}>
					<td style={{width: '10px'}}>
						{}
					</td>
					<td style={{width: '100%'}}>
						<Schema schema={schema[selectedOption]}/>
					</td>
				</tr>
				</tbody>
			</table>
		</div>
	</div>
}

function StringInput({schema})
{
	return <div>{schema}</div>
}

function isLeaf(schema)
{
	if(typeof schema!=='object')
		return 'type'
	for(const [index,value] of Object.entries(schema))
	{
		if(typeof value==='string')
		{
			console.assert('type' in schema)
			return true
		}
	}
	return false
}

function addItemDialogs()
{
	function itemDialog()
	{
		const value=prompt("Enter the new item name:")
		if(!value)
			return alert('Canceled adding item')
		else if(value in window.config.items)
		{
			alert('Sorry, that names already taken! Try another one...')
			return itemDialog()
		}
		return value
	}
	function typeDialog()
	{
		const value=prompt("Enter the new item type! Please choose from: "+Object.keys(window.getItemSchemas()))
		if(!value)
			return alert('Canceled adding item')
		else if(!(value in (window.getItemSchemas())))
		{
			alert('Sorry, thats not a module type! Please choose from: '+Object.keys((window.getItemSchemas())))
			return typeDialog()
		}
		return value
	}
	const name=itemDialog()
	if(!name)
		return
	const type=typeDialog()
	if(!type)
		return
	alert("Success! Added item. Please refresh the page to see changes.")
	window.addLinesToConfigString('items	'+name+' '+type)
	window.refreshPage()
}

function deltaDialog(description="")
{
	const value=prompt(description+'\n'+"Enter the new delta name:")
	if(!value)
		return alert('Canceled adding delta')
	else if(value in window.config.deltas)
	{
		alert('Sorry, that names already taken! Try another one...')
		return deltaDialog()
	}
	return value
}
function addDeltaDialog()
{
	const d=deltaDialog()
	if(!d)return
	alert("Success! Added delta. You will now see it in the top dropdown menu.")
	window.addLinesToConfigString('deltas	'+d)
	window.refreshGuiSchema()
}

function Schema({schema})
{
	if(!schema)
		return <div></div>
	if(isLeaf(schema))
	{
		return <LeafModifier schema={schema}/>
	}
	else
	{
		return <Multiplexer schema={schema}/>
	}
}

function TextInput({value,setValue})
{
	return <Input
		value={value}
		onChange={event=>{setValue(event.target.value)}}
		// className={classes.input}
		inputProps={{
			'aria-label': 'Description',
		}}/>
}
function NumberInput({value,setValue,step=.1})
{
	return <TextField
		type="number"
		value={value}

		inputProps={{ /*min: "0", max: "10",*/ step: step}}
		onChange={event=>{setValue(event.target.value)}}
		// className={classes.input}
	/>
}

function SelectInput({value,setValue,values=[]})
{
	return <Select value={{label: value}}
				   onChange={x=>setValue(x.value)}
				   options={values.map(key=>({value: key, label: key}))}
	/>
}

function BooleanInput({value,setValue})
{
	return <Switch
		checked={Boolean(value)}
		onChange={event=>setValue(event.target.checked)}
		color="primary"
	/>
}

function LeafModifier({schema})
{
	let onClick=function()
	{
		const value=prompt("Enter the new value:")
		if(value==null)
			return//Canceled
		else
		{
			schema.set(value)
		}
	}

	const checked=schema.config!==undefined
	// alert("ASOIJD")
	let input=<TextInput value={schema.config} setValue={schema.set}/>
	if(schema.type==='string')
	{
		input=input//Default: text input
	}
	else if(schema.type==='boolean')
	{
		input=<BooleanInput value={schema.config} setValue={schema.set}/>
	}
	else if(schema.type==='number')
	{
		input=<NumberInput value={schema.config} setValue={schema.set}/>
	}
	else if(schema.type==='select')
	{
		input=<SelectInput value={schema.config} values={schema.values} setValue={schema.set}/>
	}
	console.assert(input!==undefined)
	return <div style={{padding: 20, paddingTop: 10, backgroundColor: 'rgba(255,255,255,.5)', borderRadius: 30, alignContent: 'center'}}>
		<Switch
			checked={checked}
			disabled={schema.path[0]==='initial'}
			onChange={event=>
			{
				const checked=event.target.checked
				if(checked)/*alert(schema.state+'  '+schema.config)*/
				schema.set(checked ? schema.state : null)
			}}//if(!checked){schema.set(undefined)}else{console.assert(checked);setUsed(checked)}}}
			color="primary"
		/>{checked ? "(In delta)" : "(Not in delta)"}<br/>
		{checked ? input : <div/>}

	</div>

		//		   <Button
		//	variant="contained" onClick={onClick}
		//	size="small"
		//		   >{'State: '+schema.state+'\tConfig: '+schema.config/*schema.path+''*/}</Button>
}

let oldStuff=undefined
setInterval(window.tryRefreshInstance,100)
function tryRefreshInstance()
{
	if(window.refreshInstance)
		window.refreshInstance()
}
window.refreshInstance=undefined
function GetSimpleGui()
{
	const labels               =[]
	let [instance, setInstance]=useState({})
	window.refreshInstance=()=>setInstance(window.getGuiArchitectureInstance())
	timerEvents[0]             =()=>
	{
		let stuff=window.gameWindow.getGuiArchitectureInstance.apply(window.gameWindow, [window.gameWindow.config])
		if(stuff!==oldStuff)
		{
			setInstance(stuff)
			oldStuff=stuff
		}
	}//This function is inefficient. It must be cleaned up asap. (it lists all possible controls...which is just STUPID (but also very easy to make))

	for(const [index, i] of Object.entries(instance))
	{
		if(i.path.includes('color'))
		{
			let onClick=function()
			{
				const value=prompt("Enter the new value for "+(i.path.join(' '))+
									   '\n\n at delta '+(i.delta)+'\n\nCurrent Value: '+i.valueInConfig)
				if(value==null)
					return//Canceled
				else
				{
					let configString=localStorage.getItem('config')
					configString+='\n'+'deltas	'+i.delta+'	'+i.path.join('	')+' '+value
					window.gameWindow.setConfigDjsonInLocalStorage(configString)
				}
			}
			let color  =i.valueInConfig===undefined ? "primary" : "secondary"
			labels.push(<Button key={index}
								variant="contained" onClick={onClick}
								size="small"
								color={color}>
				{'deltas '+i.delta+' '+i.path.join(' ')}
			</Button>)
		}
	}
	return <table style={{flexGrow: 4, display: 'flex', flexDirection: 'column'}}>
		{labels}
	</table>
}

function handleNewLab()
{
	if(window.confirm('Are you sure you want to create a new lab (all progress will be lost)?'))
	{
		window.setConfigDjsonInLocalStorage('')
		window.refreshPage()
	}

}

window.gameWindow=undefined//Will be set to the 'window' element of the 'game.html' iframe
const timerEvents=[()=>{}]//Calls each one of these on a timer
function doTimerEvents()
{
	if(window.gameWindow!==undefined)//We're not ready yet: the game iframe has to finish loading first
	{
		console.log("HO")
		window.gameWindow.editorMode=true
		for(const event of timerEvents)
			event()
	}
}
setInterval(doTimerEvents, 100)

function handleLoadConfig(kwargs={})
{
	const {concat=false}=kwargs
	const code=prompt('Please enter the 4 character code (case-sensitive) that you received when pressing "Save Config"')
	if(typeof code==='string' && code.length===4)
	{
		window.loadConfigFromServer(code,{concat})
	}
	else if(!code)
	{
		alert('Loading config from server cancelled.')
	}
	else
	{
		alert('Please enter a four character code (you entered '+JSON.stringify(code)+', which has '+code.length+' characters)')
		handleLoadConfig()
	}
}

function viewMySaves()
{
	const saves=window.getMySaves()
	if(!saves.length)
		window.alert('You currently have no saved labs.')
	else
		window.alert("All of your saved file codes (bottom is most recent):"+'\n'+saves.join('\n'))
}


function handleEditCode()
{
	if(!__weAreInAnIframe__)//We are in an iframe
	{
		if(window.confirm('Are you sure you want to go to the code editor? (This option exists for mainly devs, such as Ryan Jenny and Rong)'))
		{
			window.goToUrl('../Editor/index.html')
		}
	}
	else
	{
		alert('You\'re already in the code editor.')
	}
}

function handleHideEditorGui()
{
	if(window.confirm('Are you sure you want to hide to the editor gui? (This will bring you to game.html)'))
	{
		window.goToUrl('../game.html')
	}
}


//PART OF TODO TO MAKE LABS LOADABLE VIA URL
// if(window.location.pathname.length=5)//In other words, if we have some 5 letter code

async function selectionDialog(promptText="",selection)
{
	//Will be replaced by HTML or something later
	console.assert(selection.length)
	console.assert(arguments.length===2,'Wrong number of arguments')
	let out=prompt(promptText+'\nPlease choose from these options (case sensitive):\n'+selection)
	if(selection.includes(out))
		return out
	if(!out)
		return null
	return selectionDialog(promptText,selection)
}

function displayHelp(help)
{
	alert(help)
}

function Button(props)
{
	let out=<MaterialButton style={{margin:1,fontWeight:'bold'}}
							  variant="contained"
							  size="small"
							  {...props}>
			{props.children}
		</MaterialButton>
	if(props.helpLabel||props.helptext)
	{
		let extraProps={}
		if(props.helptext)
		{
			extraProps.onClick=()=>displayHelp(props.helptext)
		}
		let title=<div style={{cursor:"help"}}{...extraProps}>
			<h3>
				{props.helpLabel || "Help"}
			</h3>
		</div>
		out=<Tooltip title={title}
						   placement="right" interactive>
			{out}
		</Tooltip>
	}
	return out
}


const tools={
	async pour()
	{
		const firstItem =await selectionDialog("Which item would you like to pour stuff from?",window.allItemIdsWithTransform())
		const secondItem=await selectionDialog("Which item would you like to pour stuff into?",window.allItemIdsWithTransform())
		const pourDeltas_prefix=deltaDialog("What should the new animation sequence be called?").trim()
		alert("Implement pouring from "+firstItem+" to "+secondItem)
		let originalFirstItemRotation =window.deltas.soaked(window.items[firstItem ], {transform: {rotation: {/*x: null, y: null, */z: null}}})
		let originalFirstItemPosition =window.deltas.soaked(window.items[firstItem ], {transform: {position: {x: null, y: null, z: null}}})
		let firstItemRotation =window.deltas.soaked(window.items[firstItem ], {transform: {rotation: {/*x: null, y: null,*/ z: null}}})//For the pouring delta
		let secondItemPosition=window.deltas.soaked(window.items[secondItem], {transform: {position: {x: null, y: null, z: null}}})//For the pouring delta

		secondItemPosition.transform.position.y+=2
		firstItemRotation.transform.rotation.z+=180

		let pourDeltas_pick_up       =pourDeltas_prefix+'_0_pick_up'       .trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_move_to_target=pourDeltas_prefix+'_1_move_to_target'.trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_rotate        =pourDeltas_prefix+'_2_rotate'        .trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_rotate_back   =pourDeltas_prefix+'_3_rotate_back'   .trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_move_back     =pourDeltas_prefix+'_4_move_back'     .trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_put_down      =pourDeltas_prefix+'_5_put_down'      .trim()//Trim just in case I put a space on the end by accident...
		function autoTo(deltaId)
		{
			return {scene:{transitions:{auto:{delta:deltaId,time:1}}}}
		}

		window.addLinesToConfigString(window.djson.stringify({
			"":"Pouring "+firstItem+" to "+secondItem+" via delta "+pourDeltas_prefix,//A comment
			deltas:{
				[window.getMostRecentDeltaId()]: {
					// scene:{transitions:{drag:{[firstItem]:{[secondItem]:{delta:pourDeltas_pick_up,time:1}}}}}
					scene:{transitions:{drag:{[firstItem]:{[secondItem]:{delta:pourDeltas_move_to_target,time:1}}}}}
				},
				// [pourDeltas_pick_up]: {
				// 	[firstItem]: {transform:{position:{y:secondItemPosition.transform.position.y}}},
				// 	...autoTo(pourDeltas_move_to_target)
				// },
				[pourDeltas_move_to_target]: {
					[firstItem]: secondItemPosition,
					...autoTo(pourDeltas_rotate)
				},
				[pourDeltas_rotate]: {
					[firstItem]: firstItemRotation,

					...autoTo(pourDeltas_rotate_back)
				},
				[pourDeltas_rotate_back]: {
					[firstItem]: originalFirstItemRotation,
					...autoTo(pourDeltas_put_down)
					// ...autoTo(pourDeltas_move_back)
				},
				// [pourDeltas_move_back]: {
				// 	[firstItem]: {transform:{position:{x:originalFirstItemPosition.transform.position.x,
				// 				                       z:originalFirstItemPosition.transform.position.z}}},
				// 	...autoTo(pourDeltas_put_down)
				// },
				[pourDeltas_put_down]: {
					[firstItem]: originalFirstItemPosition
				}
			}
		}))
	},
	async who()
	{
		alert("Please click an item, and then I'll tell you it's name")
		alert("The item you clicked is called '"+await window.getItemIdByClicking()+"'");
	},
	async where()
	{
		alert("Please click somewhere, and I'll tell you where you clicked")
		const position=await window.getPositionByMouseDown()
		if(!position)
		{
			alert("You didn't click on an item, so you didn't click on a specific position.")
		}
		else
		{
			alert("You clicked at position:\n"+window.djson.stringify(position))
		}
	},
	async when()
	{
		alert("The most recent delta is called '"+window.getMostRecentDeltaId()+"'")
	},
	async move()
	{
		alert("Please click the item that you would like to move")
		const itemId=await window.getItemIdByClicking()
		alert("Please click on where you would like to move this item to\n(This item is called '"+itemId+"')")
		const position=await window.getPositionByMouseDown()
		const deltaId=window.getMostRecentDeltaId()
		if(!position)
		{
			alert("You didn't click on an item, so you didn't click on a specific position. Cancelled moving item '"+itemId+"'")
			return
		}
		alert("Moving the item called '"+itemId+"' to position:\n"+window.djson.stringify(position))
		window.addLinesToConfigString(['deltas',deltaId,itemId,'transform','position','x '+position.x,'y '+position.y,'z '+position.z].join('\t'))
	},
	async restart()
	{
		if(window.confirm("Are you sure you want to restart the current game?"))
		{
			window.setStateFromDeltaIDArray(['initial'])
			window.requestRender()
		}
	},


}

function toolsDialog()
{
	async function toolsDialog()
	{
		const selectedTool=tools[await selectionDialog("Select a tool",Object.keys(tools))]
		if(selectedTool)
		{
			selectedTool()
		}
		else
		{
			alert("Cancelled using a tool")
		}
	}
	toolsDialog()
}

function viewState()
{
	alert("Current state:\n"+window.getSimplifiedStateDeltaStack())
}

function handlePopState()
{
	// viewState()
	let simplifiedStateDeltaStack=window.getSimplifiedStateDeltaStack()
	if(window.confirm("Would you like to pop "+ simplifiedStateDeltaStack[simplifiedStateDeltaStack.length-1]+" from the state stack?\nCurrent state: "+simplifiedStateDeltaStack))
	{
		window.popDeltaIDFromStateStack()
		window.setStateFromDeltaIDArray(window.getSimplifiedStateDeltaStack())
		window.requestRender()
	}
}

function handlePushState()
{
	async function helper()
	{
		// viewState()
		let simplifiedStateDeltaStack=window.getSimplifiedStateDeltaStack()
		let deltaID              =await selectionDialog("Select a delta to push to the state:", Object.keys(window.config.deltas))
		if(!deltaID)
		{
			alert("Cancelled pushing delta to state")
			return
		}
		window.pushDeltaIDToStateStack(deltaID)
			window.setStateFromDeltaIDArray(window.getSimplifiedStateDeltaStack())
			window.requestRender()
	}
	helper()
}



const __weAreInAnIframe__=window.location !== window.parent.location
function App()
{
	function setGameWindow(x)
	{
		window.gameWindow=x.contentWindow
	}
	//Lab
	const [schema, setSchema]=useState(window.getDeltasGuiSchema())
	window.refreshGuiSchema  =()=>setSchema(window.getDeltasGuiSchema())
	let gameStyle            ={width: '100%', height: '100%', border: '0'}
	// noinspection HtmlUnknownTarget

	return <div style={{display: 'flex', flexDirection: 'horizontal', width: '25%', height: '100%'}}>
		<div style={{padding: 10, border: 10, backgroundColor: 'rgba(255,255,255,.3)', flexGrow: 4, display: 'flex', flexDirection: 'column', overflowY: 'scroll', pointerEvents: 'auto'}}>
			<h1 style={{color: 'white', textAlign: 'center'}}>Lab<sup>3</sup></h1>
			<br/>
			{/*<ExpansionPanel style={{borderRadius:30, backgroundColor:'rgba(0,0,0,0)'}}>*/}
				{/*<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>*/}
					{/*<Typography>Buttons</Typography>*/}
				{/*</ExpansionPanelSummary>*/}
				{/*<ExpansionPanelDetails>*/}
					{/*<Typography>*/}
						{/*Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,*/}
						{/*sit amet blandit leo lobortis eget.*/}
					{/*</Typography>*/}
				{/*</ExpansionPanelDetails>*/}
			<Button                   onClick={handleEditCode                     } helptext="(Documentation goes here)"> Edit Djson Code </Button>
			<Button                   onClick={handleHideEditorGui                } helptext="(Documentation goes here)"> Hide Editor Gui </Button>
			<Button color="secondary" onClick={handleNewLab                       } helptext="(Documentation goes here)"> New Lab         </Button>
			<Button color="secondary" onClick={()=>window.saveConfigToServer()    } helptext="(Documentation goes here)"> Save Lab        </Button>
			<Button color="secondary" onClick={viewMySaves                        } helptext="(Documentation goes here)"> View Saved Labs </Button>
			<Button color="secondary" onClick={handleLoadConfig                   } helptext="(Documentation goes here)"> Load Lab        </Button>
			<Button color="secondary" onClick={()=>handleLoadConfig({concat:true})} helptext="(Documentation goes here)"> Combine Labs    </Button>
			<Button color="primary"   onClick={window.undoEditorChange            } helptext="(Documentation goes here)"> Undo            </Button>
			<Button color="primary"   onClick={addItemDialogs                     } helptext="(Documentation goes here)"> Add Item        </Button>
			<Button color="primary"   onClick={addDeltaDialog                     } helptext="(Documentation goes here)"> Add Delta       </Button>
			<Button color="primary"   onClick={toolsDialog                        } helptext="(Documentation goes here)"> Tools           </Button>
			<Button color="primary"   onClick={viewState                          } helptext="(Documentation goes here)"> View State       </Button>
			<Button color="primary"   onClick={handlePopState                     } helptext="(Documentation goes here)"> Pop State       </Button>
			<Button color="primary"   onClick={handlePushState                    } helptext="(Documentation goes here)"> Push State       </Button>
			{/*</ExpansionPanel>*/}
			<br/>
			<div style={{width:'100%'}}>
				<Schema schema={schema}/>
			 </div>
		</div>
	</div>
}
document.addEventListener("DOMContentLoaded", function(event)
{
	ReactDOM.render(<App/>, document.getElementById('root'))
	// Your code to run since DOM is loaded and ready
})
