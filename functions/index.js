const express = require('express');
const app = express();
const functions = require('firebase-functions');
const fetch = require('node-fetch');

//Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-COntrol-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Methods', 'Content-Type');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
}) 

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get( '/skills', async (req, res) => {
    try {
        let search = await getSearch()
        res.json(search.aggregators.skill)
    } catch ( error ) {
        res.status(500).json({erros: 'Request Error', message: error.message})
    }
})

app.get('/peronalityTraits', async (req, res) => {
    try {
        let userName = 'camilosanchezsalamanca'
        let user = await getUser(userName)
        res.json(user.personalityTraitsResults.groups)
    } catch ( error ) {
        res.status(500).json({erros: 'Request Error', message: error.message})
    }
})

app.get('/professionalCulture',  async (req, res) => {
    try {
        let userName = 'camilosanchezsalamanca'
        let user = await getUser(userName)
        res.json(user.professionalCultureGenomeResults.groups)
    } catch ( error ) {
        res.status(500).json({erros: 'Request Error', message: error.message})
    }
})

app.post('/userProfiles', async (req, res) => {
    let profiles = req.body
    try {
        let users = await getUsersSearch(0, 3000)
        let userProfiles = getProfiledUsers(users, profiles)
        
        res.json(userProfiles)
    } catch ( error ) {
        res.status(500).json({erros: 'Request Error', message: error.message})
    }
})


//Functions
let userUrl = 'https://bio.torre.co/api/bios/'
async function getUser(username) {
    let userResponse = await fetch(userUrl + username)
        .then(res => res.json())

    return userResponse
}

//Functions
let searchUrl = 'https://search.torre.co/opportunities/_search/?offset=0&size=1&aggregate=true'
async function getSearch() {
    let searchResponse = await fetch(searchUrl, { method: 'POST'})
    .then(res => res.json())    

    return searchResponse
}


let lotOfUsers = 'https://search.torre.co/people/_search/'
async function getUsersSearch(offset, size) {
    let lotResponse = await fetch(lotOfUsers + '?offset=' + offset + '&size=' + size + '&aggregate=false', { method: 'POST'}).then(res => res.json())    
    return lotResponse.results
}

function getProfiledUsers(users, profiles) {
    let lists = []
    profiles.forEach(profile => {
        let list = {name : profile.name, size: 0, people: []}
        users.forEach(user => {
            let userSkills = user.skills.map( item => {return item.name})
            let count = 0;
            profile.skills.forEach(skill => {
                if(userSkills.includes(skill)) count++;
            })
            if (count > 1) list.people.push(user)
        })
        list.size = list.people.length
        lists.push(list)

    });
    return lists
}

//Port
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Running on port ${ PORT }`);
});

exports.app = functions.https.onRequest(app)