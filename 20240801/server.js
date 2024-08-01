const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');

const app = express();
app.use(cors());
app.use(express.json());


// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
async function initializeDatabase() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('Successfully connected to Oracle database');
  } catch (err) {
    console.error('Error connecting to Oracle database', err);
  }
}

initializeDatabase();

app.get('/', (req, res) => {
 res.send('Hello World'); 

});

app.post('/login', async (req, res) => {
  var { id, pwd } = req.body;
  var query = `SELECT COUNT(*) AS CNT FROM MEMBER WHERE ID = '${id}' AND PWD = '${pwd}'`;
  var result = await connection.execute(query);

  const columnNames = result.metaData.map(column => column.name);
  // 쿼리 결과를 JSON 형태로 변환
  const rows = result.rows.map(row => {
    // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
    const obj = {};
    columnNames.forEach((columnName, index) => {
      obj[columnName] = row[index];
    });
    return obj;
  });

  res.json(rows);
  
});

app.get('/stuDelete', async (req, res) => {
  var { stuNo } = req.query;
  var query = `DELETE FROM STUDENT WHERE STU_NO = ${stuNo}`;
  await connection.execute(query, [], { autoCommit : true });

  res.json({msg : "삭제완료!"});
});


app.post('/insert', async (req, res) => {
  var { stuNo, stuName, stuDept, stuGrade, stuGender } = req.body;
  var query = `INSERT INTO STUDENT(STU_NO, STU_NAME, STU_DEPT, STU_GRADE, STU_GENDER) 
               VALUES ('${stuNo}', '${stuName}', '${stuDept}', '${stuGrade}', '${stuGender}')`;
  await connection.execute(query, [], { autoCommit: true });
  res.json({message : "추가되었다!"});
});

app.get('/qwer', async (req, res) => {
  var { stuNo, stuGrade } = req.query;
  var query = `UPDATE STUDENT SET STU_GRADE = ${stuGrade} WHERE STU_NO = ${stuNo}`;
  await connection.execute(query, [], { autoCommit: true });

  // res.send('Hello World');
  // UPDATE STUDENT SET STU_GRADE = 내가보낸학년 WHERE STU_NO = 내가보낸학번
});

// 학번으로 삭제
app.get('/stu-delete', async (req, res) => {
  var { stuNo } = req.query;
  var query = `DELETE FROM STUDENT WHERE STU_NO = ${stuNo}`;
  await connection.execute(query, [], { autoCommit: true });

  res.json({message : "잘 삭제되었다!"});
});

// 중복체크
app.get('/idCheck', async (req, res) => {
  var { stuNo } = req.query;
  var query = `SELECT COUNT(*) AS CNT FROM STUDENT WHERE STU_NO = ${stuNo}`;
  const result = await connection.execute(query);

  const columnNames = result.metaData.map(column => column.name);
  // 쿼리 결과를 JSON 형태로 변환
  const rows = result.rows.map(row => {
    // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
    const obj = {};
    columnNames.forEach((columnName, index) => {
      obj[columnName] = row[index];
    });
    return obj;
  });

  res.json(rows);
});



app.get('/list', async (req, res) => {
  const { keyword, grade } = req.query;
  try {
    const result = await connection.execute(
      `SELECT * FROM STUDENT WHERE (STU_NAME LIKE '%${keyword}%' OR STU_NO LIKE '%${keyword}%') AND STU_GRADE LIKE '%${grade}%'`);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/delete', async (req, res) => {
  const { stuNo } = req.query;
  try {
    await connection.execute(
      `DELETE FROM STUDENT WHERE STU_NO IN (${stuNo})`, [], { autoCommit: true }
    );
   
    res.json([{message : "삭제되었습니다"}]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/update', async (req, res) => {
  const { stuNo, stuName, stuDept, stuGrade, stuGender } = req.query;
  var query = `UPDATE 
               STUDENT SET 
                STU_NAME = '${stuName}',
                STU_DEPT = '${stuDept}',
                STU_GRADE = '${stuGrade}',
                STU_GENDER = '${stuGender}'
              WHERE STU_NO = '${stuNo}'`
  console.log(query);
  try {
    await connection.execute(query, [], { autoCommit: true });
   
    res.json([{message : "수정 되었습니다"}]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});


// 서버 시작
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});