let express = require("express");
let app = express();
let { open } = require("sqlite");
app.use(express.json());
let sqlite3 = require("sqlite3");
let path = require("path");
let dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const connectDatabase = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3003, () => {
      console.log("server started");
    });
  } catch (err) {
    console.log(`there is an ${err.message}`);
  }
};
connectDatabase();

app.get("/states/", async (request, response) => {
  let query = `
       SELECT *
       FROM state
    `;
  const getResponse = await db.all(query);

  let getList = getResponse.map((val) => {
    let req = {
      stateId: val.state_id,
      stateName: val.state_name,
      population: val.population,
    };
    return req;
  });
  response.send(getList);
});

app.get("/states/:stateId/", async (request, response) => {
  let { stateId } = request.params;
  console.log(stateId);
  let getQuery1 = `
          SELECT *
          FROM state
          WHERE state_id = ${stateId}
    `;
  let getDetail = await db.get(getQuery1);
  let ans = {
    stateId: getDetail.state_id,
    stateName: getDetail.state_name,
    population: getDetail.population,
  };
  console.log(getDetail);
  response.send(ans);
});

app.post("/districts/", async (request, response) => {
  let postDetails = request.body;
  let { districtName, stateId, cases, cured, active, deaths } = postDetails;
  console.log(districtName);
  let postQuery = `
           INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
           VALUES
                (
                    '${districtName}',
                    ${stateId},
                    ${cases},
                    ${cured},
                    ${active},
                    ${deaths}
                )
    `;
  let responseDetail = await db.run(postQuery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  console.log(districtId);
  let getDistrict = `
      SELECT *
      FROM district
      WHERE district_id = ${districtId}
    `;
  let getResponse3 = await db.get(getDistrict);
  console.log(getResponse3);
  let res = {
      districtId:  getResponse3.district_id,
  districtName: getResponse3.district_name,
  stateId: getResponse3.state_id,
  cases:  getResponse3.cases,
  cured:  getResponse3.cured,
  active:  getResponse3.active,
  deaths: getResponse3.deaths,
  }
  response.send(res)
});

app.delete("/districts/:districtId/",async (request,response)=>{
    const {districtId} = request.params
    const deleteQuery = `
                       DELETE FROM district
                       WHERE district_id = ${districtId}
    `
    await db.run(deleteQuery);
    response.send("District Removed")
})

app.put("/districts/:districtId/",async (request,response) =>{
    let {districtId} = request.params
    let {districtName,stateId,cases,cured,active,deaths} = request.body
    let putQuery = `
                 UPDATE district
                  SET
                      district_name = '${districtName}',
                      state_id = ${stateId},
                      cases = ${cases},
                      cured = ${cured},
                      active = ${active},
                      deaths = ${deaths}  
                 WHERE district_id = ${districtId} 

    ` 
   await db.run(putQuery);
   response.send("District Details Updated");
})

app.get("/states/:stateId/stats/",async (request,response)=>{
    let {stateId} = request.params;
    let query = `
               SELECT SUM(cases) AS totalCases,SUM(cured) AS  totalCured,SUM(active) AS totalActive,SUM(deaths) AS totalDeaths
               FROM district
               WHERE state_id = ${stateId}
    `
    let getRes = await db.get(query);
    response.send(getRes);
})

app.get("/districts/:districtId/details/",async (request,response)=>{
    let {districtId} = request.params;
    let getQuery4 = ` 
                    SELECT state_name AS stateName
                      FROM state NATURAL JOIN district 
                      WHERE district_id = ${districtId}
    `
    let getRes = await db.get(getQuery4)
    response.send(getRes)
})

module.exports = app


