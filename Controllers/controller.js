const service = require('../Services/services');

const create = async (req, res) => {
    console.log('controller');
    try {
        await service.createService(req, res);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const get = async (req, res) => {
    try {
            await service.getService(req, res);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const patch = async (req, res) => {
    try {
            await service.patchService(req, res);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const merge = async (req, res) => {
    try {
            await service.mergeService(req, res);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const deleteCasacade = async (req, res) => {

    const parentID = req.params.objectId;
    console.log(parentID)

    try {
            await service.deleteCascadeService(parentID,res);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const Delete = async (req, res) => {
    try {
            await service.deleteService(req, res);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

const createParent = async (req, res) => {

    const parentData = req.body;

    try {
        await service.indexParentDocument(parentData,res);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const createChild = async (req, res) => {

    const ChildData = req.body;
    const parentID=req.body.routing;

    try {
        await service.indexChildDocument(parentID,ChildData,res);
        res.status(201).send('Child document indexed successfully');
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = {
    create,
    get,
    Delete,
    patch,
    merge,
    deleteCasacade,
    createParent,
    createChild

};
