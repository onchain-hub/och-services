import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { RPCConfig, Wallet } from "../schemas/wallet.schema";
import { Model } from "mongoose";
import * as ethers from "ethers";
import { encrypt } from "../utils/crypto";
@Injectable()
export class WalletService {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<Wallet>) {}

  /**
   * Finds all wallets that belong to the specified user ID and excludes the private key field from the results.
   * @param userId The ID of the user to find wallets for.
   * @param id The ID of the wallet to find.
   * @returns A Promise that resolves to an array of wallet documents.
   */
  async getWalletsByUserId(userId: string, id?: string): Promise<Wallet[]> {
    const query = this.walletModel.find({ user: userId }).select("-seed");
    if (id) {
      query.where("_id").equals(id);
    }
    return await query;
  }

  /**
   * Finds all wallets for a user, optionally filtered by ID.
   * @param userId The ID of the user to find wallets for.
   * @param id The ID of the wallet to find.
   * @returns A Promise that resolves to an array of wallet documents.
   */
  async updateWallet(
    id: string,
    name: string,
    rpcConfig: RPCConfig
  ): Promise<Wallet | null> {
    const wallet = await this.walletModel.findById(id).exec();
    if (!wallet) {
      return null;
    }
    await wallet.updateOne({ $set: { name, rpcConfig } });
  }

  /**
   * Finds a single wallet document by ID and user ID.
   * @param userId The ID of the user that the wallet belongs to.
   * @param walletId The ID of the wallet to find.
   * @returns A Promise that resolves to the wallet document, or null if no wallet was found.
   */
  async exportWallet(userId: string, walletId: string): Promise<Wallet> {
    return this.walletModel.findOne({ _id: walletId, user: userId });
  }

  /**
   * Generates a new random wallet.
   * @returns An object containing the private key and address of the new wallet.
   */
  createRandomWallet(): { seed: string; address: string } {
    const wallet = ethers.Wallet.createRandom();
    const { mnemonic, address } = wallet;
    const { phrase } = mnemonic;
    return { seed: phrase, address };
  }

  /**
   * Saves a new wallet to the database for the specified user.
   * @param seed The private key of the new wallet.
   * @param address The address of the new wallet.
   * @param userId The ID of the user to associate the wallet with.
   * @returns A Promise that resolves to the saved wallet document.
   */
  async saveWalletToUser(
    name: string,
    seed: string,
    address: string,
    userId: string,
    rpcConfig: RPCConfig
  ): Promise<Wallet> {
    const wallet = await this.walletModel.create({
      // seed: encrypt(seed),
      name,
      seed,
      address,
      user: userId,
      rpcConfig,
    });
    return wallet;
  }
}
