let dateToday = new Date();
let today = new Date(dateToday.getTime() );
let todayFriendly = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();

let dateLastYear = new Date(dateToday.getTime() - (365 * 24 * 60 * 60 * 1000));
let dateLastYearTomorrow = new Date(dateToday.getTime() + (24 * 60 * 60 * 1000) - (365 * 24 * 60 * 60 * 1000));
let lastYeaToday = dateLastYear.getFullYear()+'/'+(dateLastYear.getMonth()+1)+'/'+dateLastYear.getDate();
let lastYearTomorrow = dateLastYearTomorrow.getFullYear()+'/'+(dateLastYearTomorrow.getMonth()+1)+'/'+dateLastYearTomorrow.getDate() ;

let dateTwoYear = new Date(dateToday.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));
let dateTwoYearTomorrow = new Date(dateToday.getTime() + (24 * 60 * 60 * 1000) - (2 * 365 * 24 * 60 * 60 * 1000));
let twoYearToday = dateTwoYear.getFullYear()+'/'+(dateTwoYear.getMonth()+1)+'/'+dateTwoYear.getDate();
let twoYearTomorrow = dateTwoYearTomorrow.getFullYear()+'/'+(dateTwoYearTomorrow.getMonth()+1)+'/'+dateTwoYearTomorrow.getDate() ;


let sqlQuery = `SELECT * FROM TxAccountCreates WHERE timestamp >= '${lastYeaToday}' AND timestamp < '${lastYearTomorrow}' ORDER BY CONVERT(DATE, timestamp) DESC`
let sqlQueryTwoYears = `SELECT * FROM TxAccountCreates WHERE timestamp >= '${twoYearToday}' AND timestamp < '${twoYearTomorrow}' ORDER BY CONVERT(DATE, timestamp) DESC`

//hard coded examples
// let sqlQueryTwoYears = `SELECT * FROM TxAccountCreates WHERE timestamp >= '2016/09/09' AND timestamp < '2016/09/10' ORDER BY CONVERT(DATE, timestamp) DESC`
// let sqlQuery = `SELECT * FROM TxAccountCreates WHERE timestamp >= '2017/12/25' AND timestamp < '2017/12/26' ORDER BY CONVERT(DATE, timestamp) DESC`



let template = `🎉🍾 Steemversary ${ todayFriendly} 🎉🍾 `;
$('.display-3').text(template);

getGlobalProps()
getAniversaryData()
  .then(data => processNamesToAccounts(data), data => console.log('error', data))
  .then(data => proccessAccountInfo(data))
  .then(data => sortAccountsByDate(data))
  .then(data => {
    let inactiveCount = countInactive(data);
    displayAccounts(data)
    displayInactiveMessage(inactiveCount)
    $('.display-3').parent().append(`<h4>On this day one year ago ${data.length} people created Steem Accounts 🙌 </h4>`);
    $('.display-3').parent().append(`<h4>${data.length - inactiveCount} of those have been active in the last 28 days 🙈</h4>`);
  })
  let progressTimer;

  $(document).ready( () => {
    NProgress.configure({ parent: '.load-area' });
    NProgress.start();
    progressTimer = setInterval( () => {
      NProgress.inc(0.25)
    }, 700)
  })

  function displayAccounts(accounts){
    let $grid = $('.grid');
    $('.grid').empty();

    accounts.forEach(user => {
      user.image = user.image ? user.image : 'img/default-user.jpg'

      var relativeLasPostTime =  user.lastPostTime == '1970-01-01T00:00:00' ? 'Never' : moment(user.lastPostTime).fromNow();
      let template =
        `<div class="grid-item col-lg-3 col-md-4 col-sm-6 active-${user.isActive}" data-name="@${user.name}" data-active="${user.isActive}">
          <a href="https://steemit.com/@${user.name}" class="user-link"><img src="${user.image}" onerror="this.src='img/default-user.jpg'" class="rounded-circle" height="80px" width="80px"></a>
          <li><a href="https://steemit.com/@${user.name}" class="user-value user-name user-link">${user.name}</a> <span class="badge badge-secondary">${user.rep}</span></li>
          <li>EFFECTIVE SP: <span class="user-value">${user.effectiveSp}</span></li>
          <li>POSTS: <span class="user-value">${user.numOfPosts}</span></li>
          <li>Followers: <span class="user-value">${user.followerCount}</span></li>
          <li>Following: <span class="user-value">${user.followingCount}</span></li>
          <li>Active:<span class="user-value"> <span class="badge badge-pill badge-dark">${relativeLasPostTime}</span></span></li>
        </div>`;

        clearInterval(progressTimer)
        NProgress.done(true);
        $grid.append(template);
    })

  }

  $('.grid').on('click', '.hide-inactive', function(){
      $('.active-false').hide()
      $(this).hide()
      $('.show-inactive').show()

  });

$('.grid').on('click', '.show-inactive', function(){
    $('.active-false').show()
    $(this).hide()
    $('.hide-inactive').show()

});

function displayInactiveMessage(inactiveCount) {
  let template =
  `<div class="grid-item col-lg-3 col-md-4 col-sm-6" >
      <h3>${inactiveCount} In-Active accounts hidden</h3>
      <button class="btn btn-small btn-dark show-inactive">Show In-Active Accounts</button>
      <button class="btn btn-small btn-dark hide-inactive">Hide In-Active Accounts</button>
  </div>`;
  $('.grid').append(template);
}
function countInactive(array) {
  var inactiveAccounts = array.filter( user => {
    return user.isActive === false;
  })
  return inactiveAccounts.length;
}
function processNamesToAccounts(data){
  console.log('NAMES TO ACCOUNTS DATA: ', data)
  let userNames = data.map(user => user.new_account_name)
  return new Promise((resolve, reject) => {
    let accountsDetails = getAccounts(userNames)

    resolve(accountsDetails)
  })
}
function getAniversaryData(){
    // return new Promise((resolve, reject) => {
        return new Promise((resolve, reject) => {
          $.post('https://sql.steemhelpers.com/api', {
            query : sqlQuery
          }, (res) => resolve(res.rows));
        });
        // let queryTwo = new Promise((resolve, reject) => {
        //   $.post('https://sql.steemhelpers.com/api', {
        //     query : sqlQueryTwoYears
        //   }, (res) => resolve(res));
        // });
        // let queries = [queryOne,queryTwo];

        // ----> disable double request until June 2018 <-------

        //  Promise.all(queries)
        //   .then(data => {
        //     console.log('query 1', data[0])
        //     console.log('query 2', data[1])
        //       let allUsers = data[0].rows.concat(data[1].rows)
        //       resolve(allUsers);
        //   });
    // });
}

function sortAccountsByDate(data){
  return new Promise((resolve, reject) => {
      let info = data.sort(function(a,b){
          return new Date(b.lastPostTime) - new Date(a.lastPostTime);
      });
      resolve(info)
  });

}
function getAccounts(accountNames){
  return steem.api.getAccounts(accountNames, (err, response) => response )
};

function proccessAccountInfo(accounts){
  let accountsData = [];
  let processAllData = new Promise((resolve, reject) => {

    let now = moment().valueOf();
    let checkTime = moment("2018-01-02T00:40:54").valueOf();
    let twentyEightDaysInSeconds = ( 28 * 24 * 60 * 60 * 1000)

  if ( checkTime >= now - twentyEightDaysInSeconds ) {
    console.log('YES ACTIVE')
  } else {
    console.log('NO IN ACTIVE')

  }
  accounts.forEach( user => {
    let profileImage = 'img/default-user.jpg';

    if (user.json_metadata == '' || user === undefined || user.json_metadata == 'undefined') {
      user.json_metadata = {
         profile_image : 'img/default-user.jpg'
      }
    } else {
      user.json_metadata = user.json_metadata ? JSON.parse(user.json_metadata).profile : {};
    }

    if (user.json_metadata == 'undefined' || user.json_metadata === undefined){
      user.json_metadata = {
         profile_image : 'img/default-user.jpg'
      }
    }
    profileImage = user.json_metadata.profile_image ? 'https://steemitimages.com/2048x512/' + user.json_metadata.profile_image : '';


    // steem power calc
    let vestingShares = user.vesting_shares;
    let delegatedVestingShares = user.delegated_vesting_shares;
    let receivedVestingShares = user.received_vesting_shares;
    let steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
    let delegatedSteemPower = steem.formatter.vestToSteem((receivedVestingShares.split(' ')[0])+' VESTS', totalVestingShares, totalVestingFundSteem);
    let outgoingSteemPower = steem.formatter.vestToSteem((receivedVestingShares.split(' ')[0]-delegatedVestingShares.split(' ')[0])+' VESTS', totalVestingShares, totalVestingFundSteem) - delegatedSteemPower;

    let isActive = ( moment(user.last_root_post).valueOf() >= now - twentyEightDaysInSeconds ) ? true : false


    accountsData.push({
      name: user.name,
      image: profileImage,
      rep: steem.formatter.reputation(user.reputation),
      effectiveSp: parseInt(steemPower  + delegatedSteemPower - -outgoingSteemPower).toLocaleString(),
      numOfPosts: user.post_count,
      followerCount: '',
      followingCount: '',
      lastPostTime: user.last_root_post,
      isActive: isActive
    });
  });

  let followerAndFollowingCount = accountsData.map( user => steem.api.getFollowCount(user.name))

  Promise.all(followerAndFollowingCount)
    .then(data => {
        for (let i = 0; i < data.length; i++) {
          accountsData[i].followerCount = data[i].follower_count
          accountsData[i].followingCount = data[i].following_count
        }
        resolve(accountsData);
    })

  });

  return processAllData;
}

function getGlobalProps(){
  return steem.api.getDynamicGlobalProperties((err, result) => {
    totalVestingShares = result.total_vesting_shares;
    totalVestingFundSteem = result.total_vesting_fund_steem;
  })
}

/// -------- BOT REPORT
let botVotes = "SELECT timestamp, author, permlink, weight FROM TxVotes WHERE voter = 'steemversary' ORDER BY CONVERT(DATE, timestamp) DESC "
let botComments = "SELECT parent_author, parent_permlink, title, url, created as timestamp FROM Comments WHERE author='steemversary' ORDER BY CONVERT(DATE, created) DESC"




function botFeed(sqlQueries){
    return new Promise((resolve, reject) => {
        Promise.all(sqlQueries).then(data => {
          let botFeed = data[0].concat(data[1]);
          resolve(botFeed)
        })
    });
}

function querySteemSql(sqlQuery){
  return new Promise((resolve, reject) => {
      $.post('https://sql.steemhelpers.com/api', {
        query : sqlQuery
      }, (res) => resolve(res.rows));
    });
}
