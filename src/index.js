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
		return <div/>
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
	let out=await asyncPrompt(promptText+'\nPlease choose from these options (case sensitive):\n'+selection)
	if(selection.includes(out))
		return out
	if(!out)
		return null
	return selectionDialog(promptText,selection)
}

async function asyncPrompt(...args)
{
	return window.prompt(...args)
}

// noinspection EqualityComparisonWithCoercionJS
async function textDialog({promptText='',condition=text=>text!=undefined,cancellable=true,asyncMethod=prompt,onInvalid=async text=>alert(`Sorry, the input '${text}' isn't allowed...please try again`)}={})
{
	while(true)
	{
		const text=await asyncMethod(promptText)
		// noinspection EqualityComparisonWithCoercionJS
		if(cancellable&&text==undefined)
		{
			return undefined//User hit cancel or something
		}
		if(condition(text))
		{
			return text
		}
		else
		{
			await onInvalid(text)
		}
	}
}

window.numberDialog=async function({promptText='',min=-1/0,max=1/0,...kwargs}={})
{
	function isNumeric(text)
	{
		return !isNaN(Number(text))
	}
	function isValid(text)
	{
		if(!isNumeric(text))
			return false
		const n=Number(text)
		return n<=max && n>=min
	}
	return Number(await textDialog({condition:isValid, promptText:promptText+'\n'+'Please choose a number between '+min+' and '+max,...kwargs}))
}

function displayHelp(help)
{
	alert(help)
}

function Button(props)
{
	let out=<MaterialButton style={{margin: 1, fontWeight: 'bold'}}
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
		out=<Tooltip title={title} placement="right" interactive>
			{out}
		</Tooltip>
	}
	return out
}

const checkpointDeltaIdPrefix='checkpoint.'
window.getAllDeltaIds=function()
{
	console.assert(arguments.length===0,'Wrong number of arguments')
	return Object.keys(window.config.deltas)
}
window.checkpointNameToDeltaId=function(checkpointName)
{
	return checkpointDeltaIdPrefix+checkpointName
}
window.deltaIdIsACheckpoint=function(deltaId)
{
	console.assert(typeof deltaId==='string')
	console.assert(arguments.length===1,'Wrong number of arguments')
	return deltaId.startsWith(checkpointDeltaIdPrefix)
}
window.getAllCheckpointDeltaIds    =function()
{
	console.assert(arguments.length===0,'Wrong number of arguments')
	return [...window.getAllDeltaIds().filter(window.deltaIdIsACheckpoint)]
}
window.getCheckpointNameFromDeltaId=function(deltaId)
{
	console.assert(arguments.length===1,'Wrong number of arguments')
	console.assert(typeof deltaId==='string')
	console.assert(window.deltaIdIsACheckpoint(deltaId),deltaId+' is NOT a checkpoint!')
	return deltaId.substr(checkpointDeltaIdPrefix.length)
}
window.getAllCheckpointNames       =function()
{
	return window.getAllCheckpointDeltaIds().map(window.getCheckpointNameFromDeltaId)
}
window.checkpointExistsByName      =function(checkpointName)
{
	return window.getAllCheckpointNames().includes(checkpointName)
}
window.addCheckpoint               =function(checkpointName,stateDeltaIdStack=window.getSimplifiedStateDeltaIdStack())
{
	//Capture the current state as a special kind of delta called a 'checkpoint', as an inheritance of the current delta stack
	console.assert(arguments.length===2,'Wrong number of arguments')
	console.assert(typeof checkpointName==='string')
	const checkpointDeltaId=checkpointDeltaIdPrefix+checkpointName
	console.assert(!(checkpointDeltaId in window.config.deltas),'Checkpoint deltaId is already taken! checkpointDeltaId='+JSON.stringify(checkpointDeltaId))
	let line1=['deltas',checkpointDeltaId,['inherit','initial',...stateDeltaIdStack].join(' ')].join('\t')
	let line2=['deltas',checkpointDeltaId,['overlay','text',...stateDeltaIdStack].join(' ')].join('\t')
	window.addLinesToConfigString([line1,line2].join('\n'))//We probably have an extra 'initial' at the beginning of the inheritance...this is OK. The delta engine doesn't care.
}
window.goToCheckpointByName        =function(checkpointName)
{
	console.assert(typeof checkpointName==='string')
	console.assert(window.checkpointExistsByName(checkpointName), 'Checkpoint "'+checkpointName+'" doesnt exist!')
	let checkpointDeltaId=window.checkpointNameToDeltaId(checkpointName)
	window.pushDeltaIDToStateStack(checkpointDeltaId)
	window.setStateFromDeltaIDArray(['initial',checkpointDeltaId])
	window.requestRender()
}

window.selectCheckpoint=function(){}//TODO implement this


const tools={
	async pour({pour_height=6.5}={})
	{
		alert("Please click and drag from the beaker you wish to pour from to the beaker you wish to pour into")
		const [firstItemId,secondItemId]=await window.getItemIdPairByDragging()
		const config=window.config
		if(config.items[firstItemId]!=='simpleBeaker')
		{
			alert("Cancelling pour operation, because the first item you selected ("+firstItemId+") is not a beaker and therefore cannot be poured from")
			return
		}
		if(config.items[secondItemId]!=='simpleBeaker')
		{
			alert("Cancelling pour operation, because the second item you selected ("+secondItemId+") is not a beaker and therefore cannot be poured into")
			return
		}
		// const firstItem =items[firstItemId]
		// const secondItem=items[secondItemId]

		// const firstItem =await selectionDialog("Which item would you like to pour stuff from?",window.allItemIdsWithTransform())
		// const secondItem=await selectionDialog("Which item would you like to pour stuff into?",window.allItemIdsWithTransform())
		const pourDeltas_prefix='pour.'+firstItemId+'.to.'+secondItemId+'.from.'+window.getMostRecentDeltaId()+'_'//deltaDialog("What should the new animation sequence be called?").trim()
		// alert("Implement pouring from "+firstItemId+" to "+secondItemId)
		let originalFirstItemRotation =window.deltas.soaked(window.items[firstItemId ], {transform: {rotation: {/*x: null, y: null, */z: null}}})
		let originalFirstItemPosition =window.deltas.soaked(window.items[firstItemId ], {transform: {position: {x: null, y: null, z: null}}})
		let firstItemRotation =window.deltas.soaked(window.items[firstItemId ], {transform: {rotation: {/*x: null, y: null,*/ z: null}}})//For the pouring delta
		let secondItemPosition=window.deltas.soaked(window.items[secondItemId], {transform: {position: {x: null, y: null, z: null}}})//For the pouring delta

		secondItemPosition.transform.position.y+=pour_height
		firstItemRotation.transform.rotation.z+=180

		const state          =window.tween.delta

		const firstState     =state[firstItemId ]
		const secondState    =state[secondItemId]

		const firstFillLevel =firstState .fluid.transform.scale.y
		const secondFillLevel=secondState.fluid.transform.scale.y
		console.warn(firstFillLevel,secondFillLevel)

		const firstFillColor =firstState .fluid.material.modes[firstState .fluid.material.mode].color
		const secondFillColor=secondState.fluid.material.modes[secondState.fluid.material.mode].color

		const maxPourLevel   =Math.min(1-secondFillLevel, firstFillLevel)//Don't let them pour more fluid than we have, or pour more fluid than the second beaker can hold
		const pourLevel      =await window.numberDialog({promptText:"How much fluid would you like to pour?",min:0,max: maxPourLevel,cancellable:false})
		const newSecondFillLevel   =pourLevel+secondFillLevel
		const newFirstFillLevel=firstFillLevel-pourLevel

		console.warn("LEVELS: ",newSecondFillLevel,newFirstFillLevel)

		const newColorAlpha  =secondFillLevel===0?1:pourLevel/newSecondFillLevel//More alpha ---> more color change. The color of the new liquid is proportional to a mix of the previous colors. The boolean condition is to avoid any possible division by zero errors.

		const newColor       =JSON.parse(JSON.stringify(window.deltas.blended(secondFillColor,firstFillColor,newColorAlpha)))

		let pourDeltas_pick_up       =pourDeltas_prefix+'_0'.trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_move_to_target=pourDeltas_prefix+'_1'.trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_rotate        =pourDeltas_prefix+'_2'.trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_pour          =pourDeltas_prefix+'_3'.trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_rotate_back   =pourDeltas_prefix+'_4'.trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_move_back     =pourDeltas_prefix+'_5'.trim()//Trim just in case I put a space on the end by accident...
		let pourDeltas_put_down      =pourDeltas_prefix+'_6'.trim()//Trim just in case I put a space on the end by accident...
		function autoTo(deltaId)
		{
			return {scene:{transitions:{auto:{delta:deltaId,time:1}}}}
		}

		window.addLinesToConfigString(window.djson.stringify({
			"":"Pouring "+firstItemId+" to "+secondItemId+" via delta "+pourDeltas_prefix,//A comment
			deltas:{
				[window.getMostRecentDeltaId()]: {
					// scene:{transitions:{drag:{[firstItem]:{[secondItem]:{delta:pourDeltas_pick_up,time:1}}}}}
					scene:{transitions:{drag:{[firstItemId]:{[secondItemId]:{delta:pourDeltas_move_to_target,time:1}}}}}
				},
				// [pourDeltas_pick_up]: {
				// 	[firstItem]: {transform:{position:{y:secondItemPosition.transform.position.y}}},
				// 	...autoTo(pourDeltas_move_to_target)
				// },
				[pourDeltas_move_to_target]: {
					[firstItemId]: secondItemPosition,
					...autoTo(pourDeltas_rotate)
				},
				[pourDeltas_rotate]: {
					[firstItemId]: firstItemRotation,
					...autoTo(pourDeltas_pour)
				},
				[pourDeltas_pour]: {
					[firstItemId]: {
						fluid: {
							transform:{
								scale:{
									y:newFirstFillLevel
								}
							}
						}
					},
					[secondItemId]:{
						fluid:{
							visible:Boolean(newSecondFillLevel),
							transform:{
								scale:{
									y:newSecondFillLevel
								}
							},
							material:{
								modes:{
									[secondState.fluid.material.mode]:{
										color:newColor
									}
								}
							}
						},
					},
					...autoTo(pourDeltas_rotate_back)
				},
				[pourDeltas_rotate_back]: {
					[firstItemId]:{... originalFirstItemRotation,							fluid:{visible:Boolean(newFirstFillLevel)}
					},
					...autoTo(pourDeltas_put_down)
					// ...autoTo(pourDeltas_move_back)
				},
				// [pourDeltas_move_back]: {
				// 	[firstItem]: {transform:{position:{x:originalFirstItemPosition.transform.position.x,
				// 				                       z:originalFirstItemPosition.transform.position.z}}},
				// 	...autoTo(pourDeltas_put_down)
				// },
				[pourDeltas_put_down]: {
					[firstItemId]: originalFirstItemPosition,
					scene:{
						transitions:{
							drag:{
								[firstItemId]:{
									[secondItemId]:'none'
								}
							}
						}
					}
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
		else
		{
			alert("Moving the item called '"+itemId+"' to position:\n"+window.djson.stringify(position))
			window.addLinesToConfigString(['deltas', deltaId, itemId, 'transform', 'position', 'x '+position.x, 'y '+position.y, 'z '+position.z].join('\t'))
		}
	},
	async add()
	{
		const itemType=await selectionDialog("What kind of item do you want to add?",'simpleBeaker mesh'.split(' '))
		const itemId=itemType+"_"+window.randomCharacters(3)
		console.assert(!(itemId in window.config.items),'Hash collision! This is a highly improbable, but technically possible error')
		window.items[itemId]=window.modules[itemType](itemId)//This code was borrowed from config.js. We should refactor this to make a unified method for adding items.
		window.addLinesToConfigString('items	'+itemId+' '+itemType+'\ndeltas	initial	'+itemId+'	castShadow true')
		window.requestRender()

		//Choose initial position
		if(window.confirm("Would you like to choose where to put this object now?"))
		{
			alert("Please click on where you would like to move this item to\n(This item is called '"+itemId+"')")
			const position=await window.getPositionByMouseDown()
			const deltaId='initial'
			if(!position)
			{
				alert("You didn't click on an item, so you didn't click on a specific position. Cancelled moving item '"+itemId+"'")
			}
			else
			{
				// alert("Moving the item called '"+itemId+"' to position:\n"+window.djson.stringify(position))
				window.addLinesToConfigString(['deltas',deltaId,itemId,'transform','position','x '+position.x,'y '+position.y,'z '+position.z].join('\t'))
			}
		}
		window.refreshPage()//Apply all missing things to the item like textures etc
	},
	async label()
	{
		alert("Please click the item that you would like to label")
		const itemId=await window.getItemIdByClicking()
		const labelItemId='label.'+itemId
		const text  =await textDialog({promptText:"What would you like it to say?"})
		const deltaId=window.getMostRecentDeltaId()
		let lines   =[['deltas',deltaId,labelItemId,'text '+text,].join('\t')]
		lines.push('items	'+labelItemId+' label')
		lines.push('deltas	initial	'+labelItemId+'	parent '+itemId)
		window.addLinesToConfigString(lines.join('\n'))
		window.requestRender()
		if(!(labelItemId in window.items))
			window.refreshPage()//Apply all missing things to the item like textures etc
	},
	async text()
	{
		const text  =await textDialog({promptText:"What would you the overlay to say?"})
		const deltaId=window.getMostRecentDeltaId()
		let lines   =[['deltas',deltaId,'overlay','text '+text,].join('\t')]
		window.addLinesToConfigString(lines.join('\n'))
	},
	async beak()
	{
		const itemType="simpleBeaker"//await selectionDialog("What kind of item do you want to add?",'simpleBeaker mesh'.split(' '))
		const itemId=itemType+"_"+window.randomCharacters(3)
		console.assert(!(itemId in window.config.items),'Hash collision! This is a highly improbable, but technically possible error')
		window.items[itemId]=window.modules[itemType](itemId)//This code was borrowed from config.js. We should refactor this to make a unified method for adding items.
		const colorName=await selectionDialog("What color?",'white blue red green cyan magenta yellow black'.split(' '))
		if(!colorName)
		{
			alert("Add beaker cancelled")
			return
		}
		const colors={
			'white'  :{r:1,g:1,b:1},
			'black'  :{r:0,g:0,b:0},
			'red'    :{r:1,g:0,b:0},
			'green'  :{r:0,g:1,b:0},
			'blue'   :{r:0,g:0,b:1},
			'cyan'   :{r:0,g:1,b:1},
			'magenta':{r:1,g:0,b:1},
			'yellow' :{r:1,g:1,b:0},
		}

		const color=colors[colorName]
		let lines='items	'+itemId+' '+itemType+'\ndeltas	initial	'+itemId+'	castShadow true'
		lines+='\n'
		lines+=['deltas	initial',itemId,'fluid	material	modes	phong	color','r '+color.r,'g '+color.g,'b '+color.b].join('\t')
		lines+='\n'
		const level      =await window.numberDialog({promptText:"How much fluid?",min:0,max: 1,cancellable:false})
		lines+=['deltas	initial',itemId,'fluid	transform	scale','y '+level].join('\t')
		lines+='\n'
		lines+=['deltas	initial',itemId,'fluid','visible '+Boolean(level)].join('\t')


		window.requestRender()

		//Choose initial position
		if(window.confirm("Would you like to choose where to put this object now?"))
		{
			alert("Please click on where you would like to move this item to\n(This item is called '"+itemId+"')")
			const position=await window.getPositionByMouseDown()
			const deltaId='initial'
			if(!position)
			{
				alert("You didn't click on an item, so you didn't click on a specific position. Cancelled moving item '"+itemId+"'")
			}
			else
			{
				// alert("Moving the item called '"+itemId+"' to position:\n"+window.djson.stringify(position))
				lines+='\n'+['deltas',deltaId,itemId,'transform','position','x '+position.x,'y '+position.y,'z '+position.z].join('\t')
			}
		}
		window.addLinesToConfigString(lines)
		window.refreshPage()//Apply all missing things to the item like textures etc
	},
	async goto()
	{
		//Go to a checkpoint
		const checkpointName=await selectionDialog('Which checkpoint would you like to go to?',window.getAllCheckpointNames())
		window.goToCheckpointByName(checkpointName)
		alert("We are now at checkpoint '"+checkpointName+"'")
	},
	async mark()
	{
		//Mark a checkpoint
		const checkpointName=await textDialog({promptText:'What would you like to call this checkpoint?',condition:window.isNamespaceable})
		if(checkpointName==null)
		{
			alert('Cancelled marking checkpoint')
			return
		}
		window.addCheckpoint(checkpointName)
		window.goToCheckpointByName(checkpointName)
		alert("Added checkpoint '"+checkpointName+"'\nYou are now in this checkpoint")
	},
	async reset()
	{
		if(window.confirm("Are you sure you want to reset the current game?"))
		{
			window.setStateFromDeltaIDArray(['initial'])
			window.requestRender()
		}
	},
	async trans()
	{
		//Add a transition to a checkpoint, or create a new checkpoint and transition to that instead
		const checkpointName = await textDialog({promptText:'Please enter the name of the checkpoint you would like to transition to.\nExisting checkpoints: '+window.getAllCheckpointNames().join(', ')})
		// noinspection EqualityComparisonWithCoercionJS
		if(checkpointName==undefined)
			return
		if(!window.checkpointExistsByName(checkpointName))
		{
			if(window.confirm('Checkpoint \''+checkpointName+'\' doesnt exist, would you like to create a new one?'))
			{
				window.addCheckpoint(checkpointName)
			}
			else
			{
				alert("Cancelled creating transition")
				return
			}
		}
		const transitionTime=await window.numberDialog({promptText:'How many seconds should this transition take to animate?',min:0,max:10})

		alert('Please either click an object or drag one object onto another in the same way you would like this transition to run')
		const [fromItemId,toItemId]=await window.getItemIdPairByDragging()

		const checkpointDeltaId=window.checkpointNameToDeltaId(checkpointName)
		const currentDeltaId   =window.getMostRecentDeltaId()

		window.addLinesToConfigString(['deltas',currentDeltaId,'scene','transitions','drag',fromItemId,toItemId,'delta '+checkpointDeltaId,'time '+transitionTime].join('\t'))

		if(window.confirm('Would you like to go to this checkpoint now?\n(To checkpoint \''+checkpointName+'\')'))
		{
			window.goToCheckpointByName(checkpointName)
			alert('You are now in checkpoint \''+checkpointDeltaId+'\'')
		}
	},
	// async fill()
	// {
	// 	//Meant for simpleBeaker items
	// 	alert("Please click a simpleBeaker item")
	// 	const itemId=await window.getItemIdByClicking()
	// 	if(window.config.items[itemId]!=='simpleBeaker')
	// 	{
	// 		alert('Sorry, but we had to cancel using the fill tool. The fill tool refers to the fill of liquid in a simpleBeaker item. However, you clicked an item called \''+itemId+'\', which is not a simpleBeaker. ')
	// 		return
	// 	}
	// 	const fillTool=await selectionDialog("What would you like to change about this item's fill?", 'color', 'level')
	// 	if(!fillTool)
	// 	{
	// 		alert('Cancelled using the fill tool')
	// 		return
	// 	}
	// 	if(fillTool==='color')
	// 	{
	//
	// 	}
	// 	else if(fillTool==='level')
	// 	{
	//
	// 	}
	// 	else
	// 	{
	// 		alert('Oops, something must have went wrong in the fill tool\'s code...this should be impossible')
	// 	}
	// }
}

function toolsDialog()
{
	async function toolsDialogHelper()
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
	toolsDialogHelper()
}

function viewState()
{
	alert("Current state:\n"+window.getSimplifiedStateDeltaIdStack())
}

function handlePopState()
{
	// viewState()
	let simplifiedStateDeltaStack=window.getSimplifiedStateDeltaIdStack()
	if(window.confirm("Would you like to pop "+ simplifiedStateDeltaStack[simplifiedStateDeltaStack.length-1]+" from the state stack?\nCurrent state: "+simplifiedStateDeltaStack))
	{
		window.popDeltaIDFromStateStack()
		window.setStateFromDeltaIDArray(window.getSimplifiedStateDeltaIdStack())
		window.requestRender()
	}
}

function handlePushState()
{
	async function helper()
	{
		// viewState()
		let simplifiedStateDeltaStack=window.getSimplifiedStateDeltaIdStack()
		let deltaID              =await selectionDialog("Select a delta to push to the state:", Object.keys(window.config.deltas))
		if(!deltaID)
		{
			alert("Cancelled pushing delta to state")
			return
		}
		window.pushDeltaIDToStateStack(deltaID)
		window.setStateFromDeltaIDArray(window.getSimplifiedStateDeltaIdStack())
		window.requestRender()
	}
	helper()
}

function Tools()
{

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
	const [toolmode, setToolmode]=useState(false)//if toomode is true just show buttons with tools and thats it
	window.refreshGuiSchema  =()=>setSchema(window.getDeltasGuiSchema())
	let gameStyle            ={width: '100%', height: '100%', border: '0'}
	// noinspection HtmlUnknownTarget

	const buttonStyle={filter:"invert(0)",margin:1,opacity:.8}
	return <div style={{display: 'flex', flexDirection: 'horizontal', width: '25%', height: '100%'}}>
		<div style={{padding: 10, border: 10, backgroundColor: 'rgba(255,255,255,.3)', flexGrow: 4, display: 'flex', flexDirection: 'column', overflowY: 'scroll', pointerEvents: 'auto'}}>
			<h1 style={{color: 'white', textAlign: 'center'}}>Lab<sup>3</sup></h1><br/><h4>{/*By Ryan Burgert*/}</h4>
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
			{!toolmode?<>
			<Button                   style={buttonStyle} onClick={handleEditCode                     } helptext="(Documentation goes here)"> Edit Djson Code </Button>
			<Button                   style={buttonStyle} onClick={handleHideEditorGui                } helptext="(Documentation goes here)"> Hide Editor Gui </Button>
			<Button color="secondary" style={buttonStyle} onClick={handleNewLab                       } helptext="(Documentation goes here)"> New Lab         </Button>
			<Button color="secondary" style={buttonStyle} onClick={()=>window.saveConfigToServer()    } helptext="(Documentation goes here)"> Save Lab        </Button>
			<Button color="secondary" style={buttonStyle} onClick={viewMySaves                        } helptext="(Documentation goes here)"> View Saved Labs </Button>
			<Button color="secondary" style={buttonStyle} onClick={handleLoadConfig                   } helptext="(Documentation goes here)"> Load Lab        </Button>
			<Button color="secondary" style={buttonStyle} onClick={()=>handleLoadConfig({concat:true})} helptext="(Documentation goes here)"> Combine Labs    </Button>
			<Button color="primary"   style={buttonStyle} onClick={window.undoEditorChange            } helptext="(Documentation goes here)"> Undo            </Button>
			<Button color="primary"   style={buttonStyle} onClick={addItemDialogs                     } helptext="(Documentation goes here)"> Add Item        </Button>
			<Button color="primary"   style={buttonStyle} onClick={addDeltaDialog                     } helptext="(Documentation goes here)"> Add Delta       </Button>
			<Button color="primary"   style={buttonStyle} onClick={toolsDialog                        } helptext="(Documentation goes here)"> Tools           </Button>
			<Button color="primary"   style={buttonStyle} onClick={viewState                          } helptext="(Documentation goes here)"> View State      </Button>
			<Button color="primary"   style={buttonStyle} onClick={handlePopState                     } helptext="(Documentation goes here)"> Pop State       </Button>
			<Button color="primary"   style={buttonStyle} onClick={handlePushState                    } helptext="(Documentation goes here)"> Push State      </Button>
			<Button color="primary"   style={buttonStyle} onClick={()=>setToolmode(true)                    } helptext="(Documentation goes here)"> Simple Mode      </Button>
			{/*</ExpansionPanel>*/}
			<br/>
			<div style={{width:'100%'}}>
				<Schema schema={schema}/>
			 </div>
			</>
				:
				<>
					<Button color="secondary"   style={buttonStyle} onClick={()=>setToolmode(false)                    } helptext="(Documentation goes here)"> Advanced Mode </Button>
					{Object.keys(tools).map(toolName=>
												<Button color="primary"   style={buttonStyle} onClick={tools[toolName]                     } helptext="(Documentation goes here)"> {toolName}       </Button>
					)}
				</>}
		</div>
	</div>
}
document.addEventListener("DOMContentLoaded", function(event)
{
	ReactDOM.render(<App/>, document.getElementById('root'))
	// Your code to run since DOM is loaded and ready
})
