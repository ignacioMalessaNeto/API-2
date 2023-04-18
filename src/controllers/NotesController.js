const knex = require("../database/knex");

const AppError = require("../utils/AppError");

class NotesController{
    async create(request, response){
        const { title, description, rating, movies_tags, links} = request.body;
        const {user_id} = request.params;

        const checkRatingExists = rating;
        if(checkRatingExists > 5 || checkRatingExists < 1) {
            throw new AppError("You need to put a note from 1 to 5");
        };

        const notes_id = await knex("movies_notes").insert({
            title,
            description,
            rating,
            user_id
        })

        const linksInsert = links.map(link => {
            return{
                notes_id,
                url: link
            }
        })

        await knex("links").insert(linksInsert);

        const tagsInsert = movies_tags.map(name => {
            return{
                notes_id,
                user_id,
                name
            }
        })

        await knex("movies_tags").insert(tagsInsert);
        
        response.json();
    }

    async show(request, response){
        const { id } = request.params;


        const note = await knex("movies_notes").where({ id }).first();
        const tags = await knex("movies_tags").where({ notes_id: id }).orderBy("name");
        const links = await knex("links").where({ notes_id: id }).orderBy("created_at");

        return response.json({
            ...note,
            tags,
            links
        });
    }

    async delete(request, response){
        const { id } = request.params;

        await knex("movies_notes").where({ id }).delete();

        return response.json()
    }

    async index(request, response){
        const { user_id, title, movies_tags } = request.query;

        let notes;

        if(movies_tags){
            const filterTags = movies_tags.split(",").map(tag => tag.trim());
            
            notes = await knex("movies_tags")
            .select([
                "movies_notes.id",
                "movies_notes.title",
                "movies_notes.user_id",
            ])
            .where("movies_notes.user_id", user_id)
            .whereLike("movies_notes.title", `%${title}%`)
            .whereIn("name", filterTags)
            .innerJoin("movies_notes", "movies_notes.id", "movies_tags.notes_id")
            .orderBy("movies_notes.title");

        } else{
            notes = await knex("movies_notes")
            .where({ user_id })
            .whereLike("title", `%${title}%`)
            .orderBy("title");
        };
        const userTags = await knex("movies_tags").where({ user_id });
        const notesWithTags = notes.map( note => {
          const noteTags = userTags.filter( tag => tag.note_id === movies_tags.notes_id);
      
          return {
            ...note,
            movies_tags: noteTags
          }
        });
      
        return response.json(notesWithTags);
    }
}

module.exports = NotesController;