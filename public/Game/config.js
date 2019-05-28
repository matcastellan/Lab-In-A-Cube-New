let defaultConfig=`preview	height 75	type djson	mode sublime	numbers true
preview	height 75	type djson	mode sublime	numbers true

~default_imports
	 Import geometries
	geometries	simpleBeakerFluid ./Assets/Models/SimpleBeaker/Fluid.obj
	geometries	simpleBeakerBeaker ./Assets/Models/SimpleBeaker/Beaker.obj
	geometries	dog ./Assets/dog.obj
	geometries	flask ./Assets/flask.obj
	 Import textures
	textures	dog ./Assets/dog.jpg
	textures	weird ./Assets/weird.jpg
	textures	blank ./Assets/blank.png
	 Import sounds
	sounds	woof ./Assets/Sounds/Woof.mp3
	sounds	nyan ./Assets/Sounds/Nyan.mp3
	sounds	sadness ./Assets/Sounds/Sadviolin.mp3

~default_light
	items	l1,l2,l3,l4,l5,l6 light
	deltas	initial	l1	position	y 10
	deltas	initial	l2	position	x 10	y 10	z -6
	deltas	initial	l3	position	x -10	y 10	z -6
	deltas	initial	l1,l2,l3	intensity .4	color	b 0.6	g 0.4
	deltas	initial	l1			intensity 1
	deltas	initial	l4			intensity .3	position	z 10	x 7	y 2
	deltas	initial	l5			intensity .3	position	z 10	x -7	y 2
	deltas	initial	l6			intensity .3	position	z 10	y 0	x 0
	

~default_camera
	deltas	initial	camera	transform	position	x  00	y 05	z 25
	deltas	initial	camera	transform	rotation	x -10	y 00	z 00
	deltas	initial	camera	fov 50

~default_table
	items	table_bottom,table_top mesh
	deltas	initial	table_bottom,table_top	geometry plane
	deltas	initial	table_bottom,table_top	transform	rotation	x -90
	deltas	initial	table_bottom,table_top	transform	scale	overall 30
	deltas	initial	table_bottom	transform	position	y -2
	deltas	initial	table_top		transform	position	y -1.995	 <-- Place the top of the table (which shows the grid) slightly above the 
	deltas	initial	table_bottom	material	modes	standard	color						r .5		g 0.5	b 0.5
	deltas	initial	table_top		material	modes	standard	wireframe true	emissive	r -0.7	g 0.1	b 1.3

~default_sky
	deltas	initial	sky	luminance 1.1
	deltas	initial	sky	sunX 0.8
	deltas	initial	sky	sunY 0.3
	deltas	initial	sky	mieDirectionalG 0.6
	deltas	initial	sky	mieCoefficient -0.195

~default_checkpoint
	deltas	checkpoint.initial	inherit initial
`
function load_config(url)
{
	getRequest(url,response=>
		{
			console.log(response)
			deltas.apply(config,djson.parse(response))
		})
}

window.getMySaves=function()
{
	//Returns a list
	return JSON.parse(localStorage.getItem('saves'))||[]
}
window.addToMySaves=function(code)
{
	assert.isString(code)
	localStorage.setItem('saves',JSON.stringify(uniqueFromRight(getMySaves().concat([code]))))
}


window.serverUrl='https://oneoverzero.pythonanywhere.com'//'', or 'oneoverzero.pythonanywhere.com
window.saveConfigToServer=async function(url=serverUrl)
{
	console.assert(arguments.length===0,'Wrong number of arguments')
	const toSave=getConfigStringFromLocalStorage()
	//Returns a URL used to get back to the saved file
	const savedURL=await doFetch('',toSave)
	if(typeof savedURL==='number')//Probably returned 404
	{
		alert('Save FAILED! Error status: '+savedURL)
	}
	else
	{
		addToMySaves(savedURL)
		alert('Save SUCCEEDED!\nBelow is the link:\n'+savedURL)
	}
}
window.loadConfigFromServer=async function(savedURL,{concat=false}={})
{
	if(!savedURL.startsWith('/saves/'))
		savedURL='/saves/'+savedURL
	console.assert(arguments.length===1,'Wrong number of arguments')
	const savedConfig=await doFetch(savedURL)
	if(typeof savedConfig==='number')//Probably returned 404
	{
		alert('Load FAILED! Error status: '+savedURL)
	}
	else
	{
		if(concat)
		{
			console.log("WHAT")
			addLinesToConfigString(savedConfig,{simplify:true})
		}
		else
		{
			setConfigDjsonInLocalStorage(savedConfig)
		}
		alert('Load SUCCEEDED!\nBelow is the link:\n'+savedURL+'\n\nPlease refresh this page to see the changes')
		refreshPage()
	}
}

function machineWrittenDjsonTag_Split(djsonString)
{
	//TODO: Refactor this method into places it can be (less redundancy)
	return djsonString.split(machineWrittenDjsonTag+'\n')
}
function machineWrittenDjsonTag_Join(list)
{
	return list.join(machineWrittenDjsonTag+'\n')
}
function simplifiedConcattedDjsons(djsonString)
{
	//Splits them along machine tag and removes duplicates
	//(That way, concatting a file with itself would yield itself, not 2*itself)
	//(This doesn't work for hand-written djsons though. That would be more of a git-like operation, which this doenst support (yet))
	djsonString=machineWrittenDjsonTag_Split(djsonString)
	djsonString=uniqueFromRight(djsonString)
	djsonString=machineWrittenDjsonTag_Join(djsonString)
	return djsonString
}


function getConfigStringFromLocalStorage()
{
	if(window.setConfigDjsonInLocalStorage_canWait_pending)
		return virtualConfigDjsonString
	virtualConfigDjsonString=localStorage.getItem('config')
	return virtualConfigDjsonString
}

let virtualConfigDjsonString=''
getConfigStringFromLocalStorage()
window.setConfigDjsonInLocalStorage_canWait_pending=false
function setConfigDjsonInLocalStorage(djsonString,kwargs={})
{
	const {setChanged=true,canWait=false,canWaitTime=1000,refresh=true}=kwargs
	virtualConfigDjsonString=djsonString
	if(!canWait)
	{
		assert.isString(djsonString)
		localStorage.setItem('config',djsonString)
		if(setChanged)
			localStorage.setItem('configChanged','true')
		if(refresh)
			refreshConfigFromLocalStorage()
	}
	else
	{
		if(!window.setConfigDjsonInLocalStorage_canWait_pending)
		{
			window.setConfigDjsonInLocalStorage_canWait_pending=true//Since localStorage.setItem is synchronous, its slow when we type characters out fast and it saves every change.
			setTimeout(function()
			{
				window.setConfigDjsonInLocalStorage_canWait_pending=false
				setConfigDjsonInLocalStorage(virtualConfigDjsonString,{...kwargs,canWait:false})
			},canWaitTime)
		}
	}
}
window.setConfigDjsonInLocalStorage=setConfigDjsonInLocalStorage


let previousLoadedConfigString
function refreshConfigFromLocalStorage()
{
	if(config.deltas===undefined)config.deltas={}
	if(config.items ===undefined)config.items ={}
	if(previousLoadedConfigString===undefined || localStorage.getItem('configChanged')==='true')
	{
		localStorage.setItem('configChanged','false')//This is to lighten the 9ms burden of refreshing this every .1 seconds when using the editor
	}
	else
	{
		return
	}
	if(!tween.time && !autoIsPending())
	{
		let storedItem=getConfigStringFromLocalStorage()
		if(!storedItem)
		{
			console.warn("Failed to load 'config' from localStorage")
			localStorage.setItem('config',defaultConfig)//Write new config file if none currently exists...
			storedItem=defaultConfig
		}
		const newConfig=djson.parse(storedItem)
		if(previousLoadedConfigString!==storedItem && !deltas.contains(config, newConfig))
		{
			playSound('./Assets/Sounds/ShortBells/E.mp3')//This got annoying, but it was here to
			// window.refreshGuiSchema()
			deltas.pour(config,newConfig)
			deltas.pour(config,deltas.poured({deltas:{initial:deltas.poured(getDefaultInitialDelta(),getDeltaByIDWithInheritance('initial'))}},newConfig))
			// deltas.pour(config,{deltas:{initial:getDefaultInitialDelta()}})
			refreshStateFromConfig()
			window.refreshGuiSchema()//Upon heari ng the bell, we try to refresh the gui schema in case anything changed
			console.log(tween.delta)
			// tween.time=1
		}
		previousLoadedConfigString=storedItem
		localStorage.setItem('readOnlyConfig',JSON.stringify(config))//Hack because this is an iframe. Sadness. Needs to communicate to the gui. JSONs are faster to read and write than djson, so this is why it's read-only.
	}
	if(!('none' in config.deltas))Object.defineProperty(config.deltas,'none',{ value:{}, enumerable: false })//dont iterate over none (which would put it in menus)
	requestRender()//Aand the game begins...
}

function saveStateToLocalStorage()
{
	localStorage.setItem('state',djson.stringify(tween.delta))
}

const config={
	get state()
	{
		return getStateDeltaStack().join(' ')
	},
	set state(string)
	{
		assert.isString(string)
		stateDeltaStack=string.split(' ')
	}
	//...more items will be added...
}
window.config=config
refreshConfigFromLocalStorage()

if(weAreInAnIframe()||window.editorMode)
{
	setInterval(refreshConfigFromLocalStorage, 100)
	setInterval(saveStateToLocalStorage, 100)
}


const machineWrittenDjsonTag=' //'//This is used to understand which lines are written by machines and which lines are written by humans. When using 'undo', we'll delete all lines form the bottom of the djson up until the point where we reach this line. This tag lets us both: 1. Not delete any hand-written code via the undo function and 2. Lets us
function addLinesToConfigString(lines,{reloadWholeDjson=true,simplify=false}={})
{
	// reloadWholeDjson=true is safe, but slower than when reloadWholeDjson=false
	// When reloadWholeDjson is true, we re-parse the whole djson (which might have macros, which might be slow).
	// But if we say reloadWholeDjson is false, the intent is that we're not adding a line that references (or is referenced by) any macros.
	// That gives us a performance boost
	assert.isString(lines)
	assert.isString(machineWrittenDjsonTag)
	//THIS MESSY CHUNK OF POORLY NAMED VARIABLES SERVES A PURPOSE
	// (though I was in a rush while coding it.)
	// Basically, this section is responsibly for not just adding a line to the end of a config string,
	// but also if the same part of the config is being edited twice (I.E. perhaps we're typing out some text for 
	// overlay	text and because it saves on every keystroke we get a big amount of transactions. We don't want them all piling up in the djson file,
	// so this just overwrites the last thing written.)

	const parsedLines=djson.parse(lines)
	const oldlines=getConfigStringFromLocalStorage()
	const tag='\n'+machineWrittenDjsonTag+'\n'
	const oldlineslist=oldlines.split(tag)
	const lastoldline=oldlineslist[oldlineslist.length-1]
	const parsedlastoldline=djson.parse(lastoldline)
	if(oldlineslist.length>1 && sameObjectTreeStructure(parsedlastoldline,parsedLines))
		oldlineslist.pop()
	oldlineslist.push(lines)
	let newDjsonString=oldlineslist.join(tag)
	if(simplify)
		newDjsonString=simplifiedConcattedDjsons(newDjsonString)
	setConfigDjsonInLocalStorage(newDjsonString,{setChanged:reloadWholeDjson,canWait:false,refresh:false})
	// setConfigDjsonInLocalStorage(getConfigStringFromLocalStorage()+'\n'+machineWrittenDjsonTag+"\n"+lines,{setChanged:reloadWholeDjson,canWait:false,refresh:false})
	if(0&&reloadWholeDjson)
	{
		refreshConfigFromLocalStorage()
	}
	else
	{
		deltas.apply(config,parsedLines)
		// refreshStateFromConfig()
		requestRender({doRefreshStateFromConfig:true})
	}
}

function reloadAssetsFromConfig()
{

	if(config.geometries)
		for(const [geometryName, geometryURL] of Object.entries(config.geometries))
			if(!(geometryName in geometries))
				load_geometry(geometryName, geometryURL)//Load all the geometries

	if(config.textures)
		for(const [Name, URL] of Object.entries(config.textures))
			if(!(Name in textures))
				load_texture(Name, URL)//Load all the textures

	if(config.items)
		for(const [itemName, itemType] of Object.entries(config.items))
			if(!(itemName in items))
				if(itemName in modules)
					console.error('ERROR: Cannot add item with name '+repr(itemName)+' because that already exists. No duplicates are allowed.')//This is a very important check to make sure that they don't get rid of things like 'scene' etc
				else
				{
					items[itemName]=modules[itemType](itemName)//Load all the items
					console.assert(is_object(items[itemName]), 'A mistake was made in the code for the module '+repr(itemType)+
						', detected while creating item '+repr(itemName)+
						'. All items are supposed to be pure objects, because thats the way deltas apply changes (to pure object trees).'+
						'Please note that this is NOT a config error, this is a javascript error: blame the programmer of the '+repr(itemType)+' module.'+
						'\nFor debugging purposes, heres a the object returned by the module: items['+repr(itemName)+']===', items[itemName])
				}
	if(config.sounds)
		for(const [soundName, soundURL] of Object.entries(config.sounds))
			sounds[soundName]=new Audio(soundURL)//Load all the sounds

	window.refreshGuiSchema()

}
reloadAssetsFromConfig()
requestTween({

				 overlay:
				 {
					 text: ''
				 }
			 })
requestTweenByID('initial')