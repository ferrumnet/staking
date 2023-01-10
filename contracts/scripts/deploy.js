// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const Wei = require("../utils");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  let now = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const stakingCap = Wei.from('1000');

  const poolName = "Festaketest";

  const stakingToken = "0xEf27B9Cb67aa93eC3494A60F1EA9380e86175B26";

  const rewardToken = "0xEf27B9Cb67aa93eC3494A60F1EA9380e86175B26";

  const stakingContract = await hre.ethers.getContractFactory("FestakedWithReward");

  let stak = await stakingContract.deploy(
    poolName,
    stakingToken, // Just a random token
    rewardToken,
    now,
    now + 1000,
    now + 2000,
    now + 3000,
    stakingCap
  );
  
  console.log('Deployed ', stak.address);

  console.log('args: ', 
    poolName,
    stakingToken, // Jsut a random token
    rewardToken,
    now,
    now + 1000,
    now + 2000,
    now + 3000,
    stakingCap
  )

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
