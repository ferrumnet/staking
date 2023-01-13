const { ethers } = require("hardhat");

class Wei {
	static from(v) {
		return ethers.utils.parseEther(v).toString();
	}
	static to(v) {
		return ethers.utils.formatEther(v);
	}
	static async toP(v) {
		return Wei.to((await v).toString());
	}
	static async balance(tokAddr, addr) {
        const tf = await ethers.getContractFactory('DummyToken');
        const tok = await tf.attach(tokAddr)
		const b = await tok.balanceOf(addr);
		return Wei.to(b.toString());
	}
	static async bal(tok, addr) {
		const b = await tok.balanceOf(addr);
		return Wei.to(b.toString());
	}
}

module.exports = Wei
