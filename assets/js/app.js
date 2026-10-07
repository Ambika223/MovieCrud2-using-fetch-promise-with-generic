const cl = console.log;
const movieContainer = document.getElementById('movieContainer');
const backdrop = document.getElementById('backdrop');
const movieModal = document.getElementById('movieModal');
const movieForm = document.getElementById('movieForm');
const showMovieBtn = document.getElementById('showMovieBtn');
const closeForm = document.querySelectorAll('.closeForm');


const movieName = document.getElementById('movieName');
const movieImg = document.getElementById('movieImg');
const movieDescription = document.getElementById('movieDescription');
const movieRating = document.getElementById('movieRating');
const year = document.getElementById('year');
const createdAt = document.getElementById('createdAt');
const genre = document.getElementById('genre');

const submitmoviebtn = document.getElementById('submitmoviebtn');
const updateMoviebtn = document.getElementById('updateMoviebtn');
const cancel = document.getElementById('cancel');

const spinner = document.getElementById('spinner');

const base_url = `https://postcrud-81c16-default-rtdb.firebaseio.com`;
const movie_url = `${base_url}/movies.json`;

function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove('d-none');
    }
    else {
        spinner.classList.add('d-none');
    }
}
function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 2000
    })
}

function onModalToggle() {
    backdrop.classList.toggle("active");
    movieModal.classList.toggle("active");
    movieForm.reset();

    if (!movieModal.classList.contains("active")) {
        updateMoviebtn.classList.add("d-none");
        submitmoviebtn.classList.remove("d-none");
    }
}


const state = {
    movieArr: [],
    editId: null
}

function objToArr(obj) {
    for (const key in obj) {
        obj[key].id = key;
        state.movieArr.unshift(obj[key])
    }
}


function setRating(rating) {
    if (rating >= 7) {
        return "badge-success"
    }
    else if (rating >= 4) {
        return "badge-warning"
    }
    else {
        return "badge-danger"
    }
}

function makeAPIcall(url, methodname, body = null) {
    body = body ? JSON.stringify(body) : null
    return fetch(url, {
        method: methodname,
        body: body,
        headers: {
            "content-type": "application/json",
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('HTTP Error: ' + res.status)
            }
            return res.json()
        })

}


function fetchMovie() {
    handleSpinner(true);
    makeAPIcall(movie_url, "GET")
        .then(data => {
            // cl(data)
            objToArr(data)
            // cl(state)
            renderingMovie(state.movieArr)

        })
        .catch(err => {
            snackBar(err, 'error');
        })
        .finally(() => {
            handleSpinner();
        })
}
fetchMovie();


function renderingMovie(arr) {
    let res = ``;
    arr.forEach(movie => {
        res += `
        <div class='col-md-3 mt-5' id="${movie.id}">
         <div class="card h-100 movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h3 class="headTitle">${movie.movieName}</h3>
                                <div><small class="createAt">Created At:${movie.createdAt}</small></div>
                                <div><small class="updatedAt">Updated At:${movie.updatedAt}</small></div>
                            </div>
                            <div class="col-2">
                                <h4 class="m-0"><span class="badge ${setRating(movie.movieRating)}">${movie.movieRating}</span></h4>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure>
                            <img src="${movie.movieImg}"
                                alt="${movie.movieName}">
                            <figcaption>
                                <h4>${movie.movieName}</h4>
                                <p>${movie.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="editMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="removeMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>
                </div>
`
    })
    movieContainer.innerHTML = res;
}

function onMovieAdd(eve) {
    eve.preventDefault();
    let movie_obj = {
        movieName: movieName.value,
        movieImg: movieImg.value,
        movieDescription: movieDescription.value,
        year: new Date(year.value).getFullYear(),
        createdAt: new Date(),
        updatedAt: new Date(),
        movieRating: movieRating.value,
        genre: genre.value
    }
    // cl(movie_obj);

    onModalToggle()
    makeAPIcall(movie_url, "POST", movie_obj)
        .then(data => {
            // cl(res)
            movie_obj.id = data.name;
            state.movieArr.unshift(movie_obj);
            let div = document.createElement("div");
            div.id = movie_obj.id;
            div.className = "col-md-3 mt-5";
            div.innerHTML = `
      <div class="card h-100 movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h3 class="headTitle">${movie_obj.movieName}</h3>
                                <div><small class="createAt">Created At:${movie_obj.createdAt}</small></div>
                                <div><small class="updatedAt d-none">Updated At:${movie_obj.updatedAt}</small></div>
                            </div>
                            <div class="col-2">
                                <h4 class="m-0"><span class="badge ${setRating(movie_obj.movieRating)}">${movie_obj.movieRating}</span></h4>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure>
                            <img src="${movie_obj.movieImg}"
                                alt="${movie_obj.movieName}">
                            <figcaption>
                                <h4>${movie_obj.movieName}</h4>
                                <p>${movie_obj.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="editMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="removeMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>
    `
            movieContainer.prepend(div);
            movieForm.reset();
            snackBar(`The new movie ${movie_obj.movieName} is added successfully`, 'success')
        })
        .catch(err => {
            snackBar(err, 'error')
        })
        .finally(() => {
            handleSpinner();
        })
}

//EDIT
function editMovie(ele) {
    let EDIT_ID = ele.closest('.col-md-3').id;
    state.editId = EDIT_ID;
    onModalToggle();
    let EDIT_OBJ = state.movieArr.find(m => m.id === EDIT_ID);
    movieName.value = EDIT_OBJ.movieName;
    movieImg.value = EDIT_OBJ.movieImg;
    movieDescription.value = EDIT_OBJ.movieDescription;
    movieRating.value = EDIT_OBJ.movieRating;
    year.value = EDIT_OBJ.year;
    genre.value = EDIT_OBJ.genre;
    submitmoviebtn.classList.add('d-none');
    updateMoviebtn.classList.remove('d-none');
}


//UPDATE
function updateMovie() {
    let UPDATE_ID = state.editId;
    let UPDATE_URL = `${base_url}/movies/${UPDATE_ID}.json`;
    let oldMovie = state.movieArr.find(m => m.id === UPDATE_ID);
    let UPDATED_OBJ = {
        movieName: movieName.value,
        movieImg: movieImg.value,
        movieDescription: movieDescription.value,
        movieRating: movieRating.value,
        year: new Date(year.value).getFullYear(),
        genre: genre.value,
        createdAt: oldMovie.createdAt,
        updatedAt: new Date(),
        id: UPDATE_ID
    }
    handleSpinner(true);
    makeAPIcall(UPDATE_URL, "PATCH", UPDATED_OBJ)
        .then(res => {
            let getIndex = state.movieArr.findIndex(m => m.id === UPDATE_ID);
            state.movieArr[getIndex] = UPDATED_OBJ;
            let col = document.getElementById(UPDATE_ID);
            //Update card on UI
            col.innerHTML = `
<div class="card h-100 movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h3 class="headTitle">${UPDATED_OBJ.movieName}</h3>
                                <div><small class="createAt">Created At:${UPDATED_OBJ.createdAt}</small></div>
                                <div><small class="updatedAt">Updated At:${UPDATED_OBJ.updatedAt}</small></div>
                            </div>
                            <div class="col-2">
                                <h4 class="m-0"><span class="badge ${setRating(UPDATED_OBJ.movieRating)}">${UPDATED_OBJ.movieRating}</span></h4>
                            </div>
                        </div>
                    </div>
                    <div class="card-body py-0">
                        <figure>
                            <img src="${UPDATED_OBJ.movieImg}"
                                alt="${UPDATED_OBJ.movieName}">
                            <figcaption>
                                <h4>${UPDATED_OBJ.movieName}</h4>
                                <p>${UPDATED_OBJ.movieDescription}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="editMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="removeMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>
            `
            snackBar(`Movie with ${UPDATE_ID} updated Successfully`, 'success');
            onModalToggle();
        })
        .catch(err => {
            cl(`Something Went Wrong while Updating`, 'error');
        })
        .finally(() => {
            handleSpinner();
        })

}


//REMOVE
function removeMovie(ele) {
    let remove_id = ele.closest('.col-md-3').id;
    const REMOVE_URL = `${base_url}/movies/${remove_id}.json`;
    Swal.fire({
        title: "Are you sure, You want to delete this movie?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    }).then((res) => {
        if (res.isConfirmed) {
            handleSpinner(true);
            makeAPIcall(REMOVE_URL, "DELETE")
                .then(res => {
                    let getIndex = state.movieArr.findIndex(movie => movie.id === remove_id);
                    state.movieArr.splice(getIndex, 1);
                    ele.closest('.col-md-3').remove();
                    snackBar(`Movie with ${remove_id} removed Successfully`, 'success');
                })
                .catch(err => {
                    snackBar(`Something went wrong while removing movie`, 'error')
                })
                .finally(() => {
                    handleSpinner();

                })
        }
    })
}

movieForm.addEventListener('submit', onMovieAdd);
updateMoviebtn.addEventListener('click', updateMovie);
showMovieBtn.addEventListener('click', onModalToggle)

closeForm.forEach(ele => {
    ele.addEventListener("click", onModalToggle);
})
