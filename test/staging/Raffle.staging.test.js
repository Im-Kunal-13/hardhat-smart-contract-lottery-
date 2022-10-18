const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name) ? describe.skip : describe("Raffle", async function () {
    let raffle, raffleEntranceFee, deployer

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
    })

    describe("fulfillRandomWords", () => {
        it("works with live Chainlink keepers and Chainlink VRF, we get a random winner", async () => {
            // enter the raffle
            const startingTimeStamp = await raffle.getLastTimeStamp()
            const accounts = await ethers.getSigners()

            await new Promise(async (resolve, reject) => {
                raffle.once("WinnerPicked", async () => {
                    console.log("WinnerPicked Event Fired!")
                    try {
                        const recentWinner = await raffle.getRecentWinner()
                        const raffleState = await raffle.getRaffleState()
                        const winnerEndingBalance = await accounts[0].getBalance()
                        const endingTimeStamp = await raffle.getLastTimeStamp()

                        expect(raffle.getPlayer(0).to.be.reverted)
                        assert.equal(recentWinner.toString(), accounts[0].address)
                        assert.equal(raffleState, 0)
                        assert.equal(winnerEndingBalance.toString(), winnerStartingBalance.add(raffleEntranceFee.toString()))
                        assert(endingTimeStamp > startingTimeStamp)
                        resolve()
                    } catch (error) {
                        console.log(error)
                        reject(error)
                    }
                })

                // Then entering the raffle
                await raffle.enterRaffle({ value: raffleEntranceFee })
                const winnerStartingBalance = await accounts[0].getBalance()
            })
            // setup the listner before we enter the raffle
            // just in case the blockchain moves really fast


        })
    })

})