const authorizeResource =
	(model, resourceField = "customer") =>
	async (req, res, next) => {
		try {
			const resource = await model.findOne({
				[resourceField]: req.user.userId,
			});
			if (!resource) {
				return res
					.status(404)
					.json({ message: `${model.modelName} not found` });
			}
			if (resource[resourceField].toString() !== req.user.userId.toString()) {
				return res
					.status(403)
					.json({ message: "You are not authorized to access this resource" });
			}
			req.resource = resource;
			next();
		} catch (error) {
			console.error(`Error authorizing ${model.modelName}:`, error);
			return res
				.status(500)
				.json({ message: "An internal server error occurred" });
		}
	};
