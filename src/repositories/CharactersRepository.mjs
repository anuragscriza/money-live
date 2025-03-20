// src/repositories/UploadCharactersRepository.mjs
import Characters from '../models/CharactersModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class CharactersRepository {
    // static async createUploadCharacters(uploadCharactersData) { return await UploadCharacters.create(uploadCharactersData); }

    static async getAllUploadCharacters() { return await Characters.find({ status: 'Active' }).sort({ createdAt: -1 }); }

    static async getUploadCharactersByCharacterId(characterId) { return await Characters.findOne({ characterId }); }

    static async getUploadCharactersByCharacterName(name) { return await Characters.findOne({ name: new RegExp(`^${name}`, 'i') }); }

    static async getAllCharactersName() { return await Characters.distinct('name'); }

    static async checkDuplicateCharactersName(name) { return await Characters.findOne({ name: new RegExp(`^${name}`, 'i') }); }

    static async updateUploadCharactersByCharacterId(characterId, uploadCharactersData) { return await Characters.findOneAndUpdate({ characterId }, uploadCharactersData, { new: true }); }

    static async deleteUploadCharactersByCharacterId(characterId) { return await Characters.findOneAndDelete({ characterId }); }

    static async filterUploadCharacters(filterParams, options, req) {
        const query = {};

        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$characterId" }, regex: searchRegex } } },
                { name: searchRegex }
            ];
        }
        return await paginate(Characters, query, options.page, options.limit, req);
    }
}

export default CharactersRepository;